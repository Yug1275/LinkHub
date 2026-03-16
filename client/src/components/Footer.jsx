const Footer = () => {
  return (
    <footer className="border-t mt-16 py-8 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
      <p className="text-sm font-medium mb-4">
        Developed with ❤️ by Yug
      </p>
      <a
        href="https://www.linkedin.com/in/yugpatel040205/"
        target="_blank"
        rel="noreferrer"
      >
        <img
          src="/assets/profile-avatar.png"
          alt="Yug's Profile"
          className="w-14 h-14 rounded-full shadow-md cursor-pointer hover:scale-110 transition mx-auto"
        />
      </a>
    </footer>
  );
};

export default Footer;
