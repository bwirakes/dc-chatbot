import { motion } from 'framer-motion';
import Link from 'next/link';

import { FileIcon, InfoIcon } from './icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-10"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-6 leading-relaxed text-center max-w-xl mx-auto">
        <h2 className="text-xl font-semibold">DC Probate Assistant</h2>
        
        <p className="flex flex-row justify-center gap-4 items-center">
          <FileIcon size={32} />
          <span>+</span>
          <InfoIcon size={32} />
        </p>
        
        <p>
          Welcome to the DC Estate Settlement Assistant. This tool is designed to help you
          navigate the complex probate process in the District of Columbia. 
          Our AI assistant will guide you through each step of closing an estate,
          providing personalized guidance based on your specific situation.
        </p>
        
        <p>
          The probate process can be overwhelming, but we&apos;re here to make it 
          more manageable. Some areas we can help with include:
        </p>
        
        <ul className="text-left list-disc mx-auto">
          <li>Understanding what probate is and when it&apos;s required</li>
          <li>Identifying assets that go through probate vs. those that don&apos;t</li>
          <li>Filing the petition for probate with the DC Superior Court</li>
          <li>Understanding different types of probate (abbreviated vs. standard)</li>
          <li>Selecting a personal representative (executor) for the estate</li>
          <li>Managing estate debts and distributing assets</li>
        </ul>
        
        <p>
          You can learn more about the DC probate process by visiting the{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://www.dccourts.gov/services/probate-matters"
            target="_blank"
          >
            DC Courts Probate Division
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
};
