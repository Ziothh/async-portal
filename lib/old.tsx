"use client";

// import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FC, PropsWithChildren, ReactNode, useState } from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client'
// import IconButton from '~/components/primitives/IconButton';
// import { BaseInput } from '~/features/form/fields/base';
// import ModalWrapper from './ModalWrapper';
// import clsx from 'clsx';
// import Combobox from '~/features/form/fields/withLabel/Combobox.withLabel';

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


const ConfirmModal = <T,>({
    // onClose,
    children,
    className,
    ...bodyProps
}: ConfirmModalProps<T>): JSX.Element => {
    return (
        <ModalWrapper
            onClose={bodyProps.close}
            className={clsx("min-w-[220px] max-w-[320px]", className)}
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

interface ConfirmModalBodyProps {
    label: ReactNode,
    description?: ReactNode,
    decline: () => void,
    confirm: () => void
}
const ConfirmModalBody: FC<PropsWithChildren<ConfirmModalBodyProps>> = ({
    decline,
    confirm,
    description,
    label,
    children,
}) => (
    <div className="flex flex-col">
        <h2 className="subTitle ml-0 mr-auto">{label}</h2>
        {description && <p className="mt-3 font-medium text-xs">{description}</p>}

        {children && (
            <div className="mt-4">
                {children}
            </div>
        )}
        <div className="flex justify-between mt-5 gap-4">
            <IconButton
                className="!max-w-[60px]"
                intent="neutral"
                icon={XMarkIcon}
                onClick={decline}
            />

            <IconButton
                className="!max-w-[60px] sm:hover:bg-transparent sm:hover:text-white"
                intent="primary"
                icon={CheckIcon}
                onClick={confirm}
            />
        </div>
    </div>
)


// export default ConfirmModal

let root: Root | null = null

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
    children: ConfirmModalBody<T>,
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
            <ConfirmModal
                {...modalProps}
                children={children}
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

/// Presets -------------------------------------------------------------------------

/** Opens a `ConfirmModal` with a check and a cross button and resolves to a boolean, based on the button clicked. */
export const confirmBooleanModal = (
    label: string,
    description?: ReactNode,
) => confirmModal<boolean>(({ decline, confirm }) => (
    <ConfirmModalBody
        {...{ label, description, decline }}
        confirm={() => confirm(true)}
    />
))

/** Opens a `ConfirmModal` with a text input and resolves to a `string`. 
 * When declined / canceled, it returns `false`. */
export const confirmTextModal = (
    label: string,
    description?: ReactNode,
    options?: {
        placeholder?: string
        defaultValue?: string
        inputClassName?: string
    }
) => confirmModal<string>(({ decline, confirm }) => {
    const [text, setText] = useState(options?.defaultValue ?? "")

    return (
        <ConfirmModalBody
            {...{ label, description, decline }}
            confirm={() => confirm(text)}
        >
            <BaseInput
                value={text}
                placeholder={options?.placeholder}
                onChange={e => setText(e.target.value)}
                inputClassName={options?.inputClassName}
            />
        </ConfirmModalBody>
    )
})

/** Opens a `ConfirmModal` with a select and resolves to a value of the `options` object. 
 * When declined / canceled, it returns `false`. */
export const confirmOptionsModal = <O extends { [name: string]: string | number | boolean | object }>(
    label: string,
    description: ReactNode,
    options: {
        placeholder?: string,
        options: Readonly<O>,
        defaultValue?: O[keyof O]
    }
) => confirmModal<O[keyof O]>(({ confirm, decline }) => {
    const [selected, setSelected] = useState<O[keyof O] | null>(options?.defaultValue ?? null)

    const PLACEHOLDER_VALUE = "#PLACEHOLDER"

    return (
        <ConfirmModalBody
            {...{ label, description, decline }}
            confirm={() => selected !== null && confirm(selected)}
        >
            <Combobox
                className="text-black"
                label=""
                options={Object.values(options.options)}
                optionParser={(option) => ({
                    label: Object.keys(options.options).find(k => options.options[k as keyof O] === option)!
                })}
                value={selected}
                onChange={setSelected}

            />
        </ConfirmModalBody>
    )
})

