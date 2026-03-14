import { useEffect, useState } from "react";
import API from "../services/api";

import WebsiteCard from "../components/WebsiteCard";
import AddWebsiteModal from "../components/AddWebsiteModal";

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

  return (

    <div className="min-h-screen bg-gray-100 p-10">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold mb-8 text-center">
          LinkHub 🚀
        </h1>

        <AddWebsiteModal onAdd={addWebsite} />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

          {websites.map(site => (

            <WebsiteCard
              key={site._id}
              site={site}
              onDelete={deleteWebsite}
            />

          ))}

        </div>

      </div>

    </div>

  );

};

export default Dashboard;