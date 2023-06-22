import type { FC } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import ModalWrapper from './ModalWrapper';

let root: Root | null = null;

/** 
 * It will render and thus display a modal when called.
 * A promise is returned that can be resolved by the child component.
 *
 * @param children - A ReactNode or Component that gets rendered inside the modal. 
 * Its props contain callbacks to resolve the promise.
 *
 * @param modalProps - Properties that get passed to ModalWrapper component.
 * */
export const asyncModal = async <T,>(
  ModalComponent: ConfirmModalBody<T>,
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
      <ModalWrapper
        {...modalProps}
        onClose={close}
        children={({ close: setModalClosed }) => (
          <ModalComponent
            resolve={(value) => {
              setModalClosed();
              res(value)
            }}
            reject={(...args) => {
              setModalClosed();
              rej(...args)
            }}
          />
        )}
      />
    )
  })

  return promise.then(res => {
    unmount(container ?? undefined);
    return res;
  })
}

// const _res = await asyncModal<string>(({ resolve }) => (
//   <div className="">
//     <button onClick={() => resolve("")}>ok</button>
//   </div>
// ))


// ------------------------------------------------------------------

interface ConfirmModalChildrenProps<T> {
  resolve: (value: T) => void
  reject: (...args: Parameters<typeof Promise.reject<T>>) => void
}

type ConfirmModalBody<T> = FC<ConfirmModalChildrenProps<T>>

interface ConfirmModalCallProps {
  className?: string
}
