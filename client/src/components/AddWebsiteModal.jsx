import { useState } from "react";
import API from "../services/api";

const AddWebsiteModal = ({ onAdd }) => {

    const [form, setForm] = useState({
        name: "",
        url: "",
        category: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        const meta = await API.post("/metadata", {
            url: form.url
        });

        const res = await API.post("/websites", {
            ...form,
            name: meta.data.title,
            icon: meta.data.favicon
        });

        onAdd(res.data);

        setForm({
            name: "",
            url: "",
            category: ""
        });

    };

    return (

        <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row gap-3 mb-8"
        >

            <input
                name="url"
                placeholder="Paste website URL (https://...)"
                value={form.url}
                onChange={handleChange}
                className="border rounded p-2 flex-1"
            />

            <button className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800">
                Add Website
            </button>

        </form>

    );

};

export default AddWebsiteModal;