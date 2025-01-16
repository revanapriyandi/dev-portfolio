export default function Dashboard() {
    return (
        <div className="flex flex-1">
            <div className="p-2 md:p-10  border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
                <div className="flex gap-2">
                    {[...new Array(4)].map((_, index) => (
                        <div
                            key={"first" + index}
                            className="h-20 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
                        ></div>
                    ))}
                </div>
                <div className="flex gap-2 flex-1">
                    {[...new Array(2)].map((_, index) => (
                        <div
                            key={"second" + index}
                            className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
                        ></div>
                    ))}
                </div>
            </div>
        </div>

    );
};
