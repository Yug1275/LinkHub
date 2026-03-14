const CategoryCard = ({ category, websites, onDelete }) => {

  return (

    <div className="bg-white text-black rounded-2xl p-8 shadow-md border">

      <h2 className="text-xl font-semibold text-center">
        {category}
      </h2>

      <p className="text-gray-500 text-center mb-6">
        {websites.length} websites
      </p>

      <div className="grid grid-cols-3 gap-6 justify-items-center">

        {websites.map(site => (

          <div key={site._id} className="flex flex-col items-center gap-2">

            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2"
            >

              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">

                <img
                  src={site.icon}
                  alt="icon"
                  className="w-8 h-8"
                />

              </div>

              <p className="text-sm text-center font-medium">
                {site.name}
              </p>

            </a>

            <button
              onClick={() => onDelete(site._id)}
              className="text-red-500 text-xs hover:text-red-700"
            >
              Delete
            </button>

          </div>

        ))}

      </div>

    </div>

  );

};

export default CategoryCard;