import type{ FC, ReactNode } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import ModalWrapper from './ModalWrapper';
import clsx from 'clsx';

let root: Root | null = null;


// interface ConfirmModalChildrenProps<T> 

// type ModalBody<T> = ReactNode | FC<{
//     close: () => void
//     confirm: (value: T) => void
//     decline: () => void
// }>

/** 
 * It will render and thus display a modal when called.
 * A promise is returned that can be resolved by the child component.
 *
 * @param children - A ReactNode or Component that gets rendered inside the modal. 
 * Its props contain callbacks to resolve the promise.
 *
 * @param modalProps - Properties that get passed to ModalWrapper component.
 * */
export const confirmModal = async <T = boolean>(
    modal: ConfirmModalBody<T>,
    modalProps: ConfirmModalCallProps = {}
) => {
    const body = document.querySelector("body")!

    const unmount = (container?: HTMLElement) => {
        // dirty way of doing things
        setTimeout(() => {
            root?.unmount()

            root = null

            container?.remove()
        }, 300)
    }

    let container: null | HTMLDivElement = null

    const promise = new Promise<T | false>((res, rej) => {
        if (root === null) {
            container = document.createElement("div")
            container.setAttribute("data-modal-container", "")
            body.appendChild(container)

            root = createRoot(container)
        }


        root.render(
            <Modal
                {...modalProps}
                children={modal}
                close={() => res(false)}
                confirm={(value) => res(value)}
                decline={() => res(false)}
            />
        )
    })

    return promise.then(res => {
        unmount(container ?? undefined)
        return res
    })
}

// ------------------------------------------------------------------

interface ConfirmModalChildrenProps<T> {
    close: () => void
    confirm: (value: T) => void
    decline: () => void
}

type ConfirmModalBody<T> = ReactNode | FC<ConfirmModalChildrenProps<T>>

interface ConfirmModalCallProps {
    className?: string
    // closeOnBackdropClick?: boolean
}

interface ConfirmModalProps<T> extends ConfirmModalChildrenProps<T>, ConfirmModalCallProps {
    children: ConfirmModalBody<T>

    // onClose: () => void

}

const Modal = <T,>({
    // onClose,
    children,
    className = "min-w-[220px] max-w-[320px]",
    ...bodyProps
}: ConfirmModalProps<T>): JSX.Element => {
    return (
        <ModalWrapper
            onClose={bodyProps.close}
            className={clsx(className)}
        >
            {typeof children === "function"
                ? ({ close: setModalClosed }) => children({
                    close: () => {
                        setModalClosed()
                        bodyProps.close()
                    },
                    confirm: (value) => {
                        setModalClosed()
                        bodyProps.confirm(value)
                    },
                    decline: () => {
                        setModalClosed()
                        bodyProps.decline()
                    },
                })
                : children}
        </ModalWrapper>
    )
}
