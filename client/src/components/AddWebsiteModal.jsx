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
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">

            <input
                name="name"
                placeholder="Website Name"
                value={form.name}
                onChange={handleChange}
                className="border p-2"
            />

            <input
                name="url"
                placeholder="https://..."
                value={form.url}
                onChange={handleChange}
                className="border p-2"
            />

            <input
                name="category"
                placeholder="Category"
                value={form.category}
                onChange={handleChange}
                className="border p-2"
            />

            <button className="bg-black text-white px-4">
                Add
            </button>

        </form>
    );

};

export default AddWebsiteModal;