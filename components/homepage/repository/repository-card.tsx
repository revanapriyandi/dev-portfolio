import { Repository } from "@/types/repository";
import { formatFileSizeDisplay } from "@/utils/format";
import { motion } from "framer-motion";

interface RepositoryCardProps {
  repo: Repository;
}

const RepositoryCard: React.FC<RepositoryCardProps> = ({ repo }) => {
  return (
    <motion.div
      className="group relative h-full"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#16f2b3]/0 via-violet-500/0 to-violet-500/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />
      <motion.div
        className="relative flex h-full cursor-pointer flex-col rounded-2xl border border-white/10 bg-[#171544]/85 p-5 transition-all duration-300"
        onClick={() => window.open(repo.url, "_blank")?.focus()}
        whileHover={{ y: -8, scale: 1.01 }}
      >
        <div className="mb-3 flex items-center gap-2">
          <svg
            aria-hidden="true"
            className="h-5 w-4 text-gray-400"
            height="20"
            role="img"
            viewBox="0 0 12 16"
            width="14"
          >
            <path
              fillRule="evenodd"
              d="M4 9H3V8h1v1zm0-3H3v1h1V6zm0-2H3v1h1V4zm0-2H3v1h1V2zm8-1v12c0 .55-.45 1-1 1H6v2l-1.5-1.5L3 16v-2H1c-.55 0-1-.45-1-1V1c0-.55.45-1 1-1h10c.55 0 1 .45 1 1zm-1 10H1v2h2v-1h3v1h5v-2zm0-10H2v9h9V1z"
              fill="currentColor"
            ></path>
          </svg>
          <h3 className="text-lg font-semibold text-white">{repo.name}</h3>
        </div>

        <p className="mb-4 line-clamp-3 text-sm text-gray-300" title={repo.description}>
          {repo.description}
        </p>

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {repo.primaryLanguage && (
              <span className="flex items-center gap-1">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: repo.primaryLanguage.color }}
                ></div>
                <p className="text-sm text-gray-300">{repo.primaryLanguage.name}</p>
              </span>
            )}

            <span className="flex items-center gap-1">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-gray-400"
                viewBox="0 0 10 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 1a1.993 1.993 0 0 0-1 3.72V6L5 8 3 6V4.72A1.993 1.993 0 0 0 2 1a1.993 1.993 0 0 0-1 3.72V6.5l3 3v1.78A1.993 1.993 0 0 0 5 15a1.993 1.993 0 0 0 1-3.72V9.5l3-3V4.72A1.993 1.993 0 0 0 8 1zM2 4.2C1.34 4.2.8 3.65.8 3c0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3 10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2zm3-10c-.66 0-1.2-.55-1.2-1.2 0-.65.55-1.2 1.2-1.2.65 0 1.2.55 1.2 1.2 0 .65-.55 1.2-1.2 1.2z"
                  fill="currentColor"
                ></path>
              </svg>
              <p className="text-sm text-gray-300">{repo.forkCount}</p>
            </span>

            <span className="flex items-center gap-1">
              <svg
                aria-hidden="true"
                className="h-4 w-4 text-gray-400"
                viewBox="0 0 14 16"
              >
                <path
                  fillRule="evenodd"
                  d="M14 6l-4.9-.64L7 1 4.9 5.36 0 6l3.6 3.26L2.67 14 7 11.67 11.33 14l-.93-4.74L14 6z"
                  fill="currentColor"
                ></path>
              </svg>
              <p className="text-sm text-gray-300">{repo.stargazers.totalCount}</p>
            </span>
          </div>

          <div className="text-sm text-gray-300">
            {formatFileSizeDisplay(repo.diskUsage)}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RepositoryCard;
