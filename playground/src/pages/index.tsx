import { type NextPage } from "next";
import { asyncModal } from 'async-portal';
import ModalWrapper from "~/components/ModalWrapper";

async function askForPermission() {
  const res = await asyncModal<boolean | null>(({ resolve, reject: _ }) => {
    return (
      <ModalWrapper
        defaultOpen
        onClose={() => resolve(null)}
      >
        {({ close }) => {
          const ok = (...args: Parameters<typeof resolve>) => {
            close();
            return resolve(...args);
          }

          return (
            <div className="grid grid-cols-2 gap-4 bg-neutral-900 shadow-lg text-white p-7 rounded-lg w-fit">
              <button onClick={() => ok(true)}>Yes</button>
              <button onClick={() => ok(false)}>No</button>
              <button className="col-span-2" onClick={() => ok(null)}>Close</button>
            </div>
          )
        }}
      </ModalWrapper >
    )
  })

  console.log(`User responded with "${res}"`);

  return res;
}

const Home: NextPage = () => {
  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>
          <button
            className="text-white border px-4 py-2 rounded-md"
            onClick={askForPermission}
          >
            Open modal
          </button>
        </div>
      </main>
    </>
  );
};

export default Home;
