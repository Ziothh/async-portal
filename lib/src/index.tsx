import type { FC } from 'react';
import { type Root, createRoot } from 'react-dom/client';

let root: Root | null = null;

/** 
 * It will render and thus display a the component when called.
 * A promise is returned that can be resolved by the component.
 * */
export const asyncPortal = async <T,>(
  PortalComponent: FC<PortalComponentProps<T>>,
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

  let container: null | HTMLDivElement = null;
  const promise = new Promise<T>((res, rej) => {
    if (root === null) {
      container = document.createElement("div");
      container.setAttribute("data-async-portal-container", "");
      body.appendChild(container);

      root = createRoot(container);
    }

    root.render(
      <PortalComponent
        resolve={res}
        reject={rej}
      />
    );
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

export interface PortalComponentProps<T> {
  resolve: (value: T) => void
  reject: (...args: Parameters<typeof Promise.reject<T>>) => void
}
