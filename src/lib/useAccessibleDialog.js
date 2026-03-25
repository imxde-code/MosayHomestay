import { useEffect, useRef } from 'react'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusableElements(container) {
  if (!container) {
    return []
  }

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) => {
      if (!(element instanceof HTMLElement)) {
        return false
      }

      if (element.hasAttribute('disabled')) {
        return false
      }

      if (element.getAttribute('aria-hidden') === 'true') {
        return false
      }

      return element.getClientRects().length > 0
    },
  )
}

export function useAccessibleDialog({
  isOpen,
  dialogRef,
  onClose,
  initialFocusRef,
  returnFocusRef,
}) {
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    const dialog = dialogRef.current

    if (!dialog) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    const explicitReturnFocus =
      returnFocusRef?.current instanceof HTMLElement
        ? returnFocusRef.current
        : null
    const fallbackReturnFocus =
      explicitReturnFocus ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null)

    document.body.style.overflow = 'hidden'

    const focusFrame = window.requestAnimationFrame(() => {
      const nextFocusTarget =
        initialFocusRef?.current instanceof HTMLElement
          ? initialFocusRef.current
          : getFocusableElements(dialog)[0] ?? dialog

      nextFocusTarget.focus()
    })

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const activeDialog = dialogRef.current

      if (!activeDialog) {
        return
      }

      const focusableElements = getFocusableElements(activeDialog)

      if (focusableElements.length === 0) {
        event.preventDefault()
        activeDialog.focus()
        return
      }

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      const activeElement = document.activeElement

      if (event.shiftKey) {
        if (
          activeElement === firstElement ||
          !activeDialog.contains(activeElement)
        ) {
          event.preventDefault()
          lastElement.focus()
        }

        return
      }

      if (activeElement === lastElement || !activeDialog.contains(activeElement)) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    const handleFocusIn = (event) => {
      const activeDialog = dialogRef.current

      if (!activeDialog) {
        return
      }

      if (event.target instanceof Node && activeDialog.contains(event.target)) {
        return
      }

      const nextFocusTarget =
        initialFocusRef?.current instanceof HTMLElement
          ? initialFocusRef.current
          : getFocusableElements(activeDialog)[0] ?? activeDialog

      nextFocusTarget.focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('focusin', handleFocusIn)

    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('focusin', handleFocusIn)

      const restoreTarget = explicitReturnFocus ?? fallbackReturnFocus

      if (restoreTarget && document.contains(restoreTarget)) {
        window.requestAnimationFrame(() => {
          restoreTarget.focus()
        })
      }
    }
  }, [dialogRef, initialFocusRef, isOpen, returnFocusRef])
}
