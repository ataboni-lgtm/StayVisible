## Structure

* Always use ShadCN UI components if available(Use the Radix UI variation).
* Use tailwind for styling if possible, resort to .css files ONLY when the styling is too complex to represent in tailwind (e.g. animations).
* All `page.tsx` should have a `@container/page` class, and all responsive design must be done based on its container query (e.g. `@lg/page:flex-row`).
* All `page.tsx` should be server side, and perform authentication & authorization. If unauthorized, throw an error.
* Use comment dividers to separate Refs, States, Callbacks, Effects, and JSX Return.
* DO NOT use server actions.