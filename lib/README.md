# async-portal
This is a small library that makes working with react portals in an asynchronous manner easier.

This is useful when you quickly want to get asynchronous responses from modals and dialogs.

## The package
It exports one single function `asyncPortal` that creates a portal when called
and renders the given component into it. 

The rendered component can resolve or reject a promise. 
When doing so `Promise` returned from `asyncPortal` finishes and the portal gets unmounted.

## Example
For a more in depth example look at the [playground page in the repository](https://github.com/Ziothh/async-portal/blob/main/playground/src/pages/index.tsx).

This is a smaller example:
```ts
// /pages/index.tsx
import { asyncPortal } from 'async-portal';

const askPermission = async () => {
    const res = await asyncPortal<boolean | null>(({ resolve, reject }) => {
        const resolveButtonClick = (e: MouseEvent, ...args: Parameters<typeof resolve>) => {
            e.preventDefault();
            e.stopPropagation();
            resolve(...args);
        }

        return (
         <div onClick={reject}>
             <h1>Are you sure?</h1>
             <button onClick={(e) => resolveButtonClick(e, true)}>yes</button>
             <button onClick={(e) => resolveButtonClick(e, false)}>no</button>
             <button onClick={(e) => resolveButtonClick(e, false)}>close</button>
         </div>
        );
    });

    return res;
}

export default () => (
    <div>
        <button onClick={async () => {
            const res = await askPermission();

            console.log(res);
        }}>
            Open permisson dialog
        </button>
    <div>
);
```

