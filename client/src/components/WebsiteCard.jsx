const WebsiteCard = ({ site, onDelete }) => {

  return (

    <div className="bg-white rounded-xl shadow hover:shadow-lg hover:scale-105 transition p-4 flex flex-col items-center gap-3">

      <a
        href={site.url}
        target="_blank"
        rel="noreferrer"
        className="flex flex-col items-center gap-2"
      >

        <img
          src={site.icon}
          alt="icon"
          className="w-10 h-10"
        />

        <p className="font-semibold text-sm text-center">
          {site.name}
        </p>

      </a>

      <button
        onClick={() => onDelete(site._id)}
        className="text-xs text-red-500 hover:text-red-700"
      >
        Delete
      </button>

    </div>

  );

};

export default WebsiteCard;