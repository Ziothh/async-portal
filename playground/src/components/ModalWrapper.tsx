"use client"

import { Dialog, Transition } from "@headlessui/react"
import clsx from "clsx"
import { ComponentProps, FC, Fragment, ReactNode, useEffect, useState } from "react"

interface Props {
  onOpen?: () => void
  onClose?: () => void
  backdropClassName?: string
  className?: string
  defaultOpen?: boolean
  children?: ReactNode | FC<{
    close: () => void
  }>
  transition?: ComponentProps<typeof Transition['Child']>
  backdropTransition?: ComponentProps<typeof Transition['Child']>
}

/** A modal wrapper component that handles all of the transitions and most of the styling for a modal.
 * It uses headlessui Transition and Dialog under the hood.
 *
 * Its children can be either a ReactNode or a FC that receives a close callback to close the modal.
 * */
const ModalWrapper: React.FC<Props> = ({
  children,
  onClose,
  onOpen,
  backdropClassName,
  defaultOpen = true,
  className,
  transition = {},
  backdropTransition = {},
}) => {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    // Transition needs to go from show false to true to animate
    if (defaultOpen) setIsOpen(true)
  }, [])

  return (
    <Transition
      show={isOpen}
      as={Fragment}
      afterEnter={onOpen}
      afterLeave={onClose}
    >
      <Dialog onClose={() => setIsOpen(false)}
        className={"fixed inset-0 flex justify-center items-center z-999"}
      >
        <div className="relative flex justify-center items-center">
          {/* Use one Transition.Child to apply one transition to the backdrop... */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            
            // @ts-ignore
            {...backdropTransition}
          >
            <Dialog.Backdrop className={clsx(
              "absolute inset-0 z-0 bg-gray-900 bg-opacity-30 backdrop-blur-md",
              backdropClassName,
            )} />
          </Transition.Child>

          {/* ...and another Transition.Child to apply a separate transition to the contents. */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            // @ts-ignore
            {...transition}
          >
            <Dialog.Panel className={clsx(
              `relative z-10`,
              className
            )}
            >
              {typeof children === "function"
                ? children({ close: () => setIsOpen(false) })
                : children}
            </Dialog.Panel>
          </Transition.Child>

        </div>
      </Dialog>
    </Transition>
  )
}

export default ModalWrapper;
