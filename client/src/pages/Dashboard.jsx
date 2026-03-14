import { useEffect, useState } from "react";
import API from "../services/api";

import AddWebsiteModal from "../components/AddWebsiteModal";
import CategoryCard from "../components/CategoryCard";

const Dashboard = () => {

  const [websites, setWebsites] = useState([]);

  useEffect(() => {
    fetchWebsites();
  }, []);

  const fetchWebsites = async () => {
    const res = await API.get("/websites");
    setWebsites(res.data);
  };

  const addWebsite = (site) => {
    setWebsites([...websites, site]);
  };

  const deleteWebsite = async (id) => {
    await API.delete(`/websites/${id}`);
    setWebsites(websites.filter(site => site._id !== id));
  };

  // Group websites by category
  const groupByCategory = (sites) => {
    return sites.reduce((groups, site) => {
      const category = site.category || "General";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(site);

      return groups;
    }, {});
  };

  const groupedWebsites = groupByCategory(websites);

  return (

    <div className="min-h-screen bg-white">

      <div className="max-w-6xl mx-auto px-6 py-10">

        <h1 className="text-4xl font-bold text-center text-black mb-8">
          LinkHub 🚀
        </h1>

        <AddWebsiteModal onAdd={addWebsite} />

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">

          {Object.keys(groupedWebsites).map(category => (

            <CategoryCard
              key={category}
              category={category}
              websites={groupedWebsites[category]}
              onDelete={deleteWebsite}
            />

          ))}

        </div>

      </div>

    </div>

  );

};

export default Dashboard;