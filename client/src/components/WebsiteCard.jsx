import { useDrag, useDrop } from "react-dnd";

const WebsiteCard = ({ site, index, moveCard, onDelete }) => {

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "CARD",
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: "CARD",
    hover(item) {

      if (item.index === index) return;

      moveCard(item.index, index);

      item.index = index;
    },
  }));

  return (

    <div
      ref={(node) => drag(drop(node))}
      className="bg-white rounded-xl shadow hover:shadow-lg hover:scale-105 transition p-4 flex flex-col items-center gap-3 cursor-move"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >

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

        <p className="font-semibold text-sm text-center truncate w-full">
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