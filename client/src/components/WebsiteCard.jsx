const WebsiteCard = ({ site, onDelete }) => {

  return (
    <div className="bg-white shadow p-4 rounded flex justify-between items-center">

      <a
        href={site.url}
        target="_blank"
        rel="noreferrer"
        className="font-semibold"
      >
        {site.name}
      </a>

      <button
        onClick={() => onDelete(site._id)}
        className="text-red-500"
      >
        Delete
      </button>

    </div>
  );

};

export default WebsiteCard;