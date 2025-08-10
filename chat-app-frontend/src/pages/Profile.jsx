import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    profileImage: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    axios
      .get("http://localhost:5001/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data.user);
        setFormData({
          username: res.data.user.username,
          email: res.data.user.email,
          profileImage: res.data.user.profileImage || "",
        });
      })
      .catch(() => {
        navigate("/");
      });
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage") {
      setFormData((prev) => ({
        ...prev,
        profileImage: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      if (formData.profileImage instanceof File) {
        data.append("profileImage", formData.profileImage);
      }

      await axios.put("http://localhost:5001/api/users/me", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Profile updated successfully");
      setEditMode(false);

      // Refresh user info
      const res = await axios.get("http://localhost:5001/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setFormData({
        username: res.data.user.username,
        email: res.data.user.email,
        profileImage: res.data.user.profileImage || "",
      });
    } catch (err) {
      alert("Failed to update profile");
      console.error(err);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-gray-800 rounded text-white">
      <h1 className="text-3xl mb-6">Your Profile</h1>

      {!editMode ? (
        <div>
          <img
            src={
              user.profileImage
                ? `http://localhost:5001/uploads/${user.profileImage}`
                : "https://via.placeholder.com/150"
            }
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
          <p>
            <strong>Username:</strong> {user.username}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <button
            onClick={() => setEditMode(true)}
            className="mt-4 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 rounded text-black"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 rounded text-black"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Profile Image</label>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
              className="text-white"
            />
            {formData.profileImage && formData.profileImage instanceof File && (
              <img
                src={URL.createObjectURL(formData.profileImage)}
                alt="Preview"
                className="w-24 h-24 mt-2 rounded-full object-cover"
              />
            )}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditMode(false)}
              className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default Profile;
