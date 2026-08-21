import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const templates = [
  { id: 1, name: "Billing Services", details: {} },
  { id: 2, name: "POS Hardware", details: {} },
  { id: 3, name: "Software Development", details: {} },
  { id: 4, name: "Data Sync Service", details: {} },
  { id: 5, name: "LemonBooks Service", details: {} },
];

export default function TemplateMenu() {
  const [open, setOpen] = useState(false);

  const containerVariants = {
    open: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
    closed: {
      transition: {
        staggerChildren: 0.1,
        staggerDirection: -1,
      },
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
    closed: {
      opacity: 0,
      x: 20,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  return (
    <div className="flex   justify-end items-center w-full wrap  relative">
      <div className="flex items-center gap-3">
        <AnimatePresence>
          {open && (
            <motion.div
              onClick={() => {
                setOpen((prev) => !prev);
              }}
              className="flex gap-3 "
              initial="closed"
              animate="open"
              exit="closed"
              variants={containerVariants}
            >
              {templates.map((template) => (
                <motion.div
                  key={template?.id}
                  className="border cursor-pointer border-gray-400 px-4 py-[6px] rounded shadow"
                  variants={itemVariants}
                >
                  {template?.name}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        {
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex items-center justify-center px-6 py-2 text-sm font-semibold leading-5 text-gray-900 transition-all duration-200  border-2 border-gray-400 rounded-md  "
          >
            <motion.svg
              className="w-4 h-4 mr-2"
              viewBox="0 0 30 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              stroke="currentColor"
              strokeWidth="1"
              animate={{ rotate: open ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <path
                d="M20.8 28.4L7 14.7L20.8 1L22.8 3L11 14.7L22.8 26.4L20.8 28.4Z"
                fill="currentColor"
              />
            </motion.svg>
            Templates
          </button>
        }
      </div>
    </div>
  );
}
