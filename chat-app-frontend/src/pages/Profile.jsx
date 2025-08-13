import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PencilSquareIcon, ArrowLeftIcon } from "@heroicons/react/24/solid";

function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    profileImage: "", // can be URL string or File
    password: "",
    confirmPassword: "",
  });
  const [fullscreenImage, setFullscreenImage] = useState(false);
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
          profileImage: res.data.user.profileImageUrl || "", // <-- use profileImageUrl here
          password: "",
          confirmPassword: "",
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
        profileImage: files[0], // File object
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

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const token = localStorage.getItem("token");
    try {
      const data = new FormData();
      data.append("username", formData.username);
      data.append("email", formData.email);
      if (formData.profileImage instanceof File) {
        data.append("profileImage", formData.profileImage);
      }
      if (formData.password) {
        data.append("password", formData.password);
      }

      await axios.put("http://localhost:5001/api/users/me", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Profile updated successfully");
      setEditMode(false);

      // Refresh user data after update
      const res = await axios.get("http://localhost:5001/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data.user);
      setFormData({
        username: res.data.user.username,
        email: res.data.user.email,
        profileImage: res.data.user.profileImageUrl || "", // keep consistent here too
        password: "",
        confirmPassword: "",
      });
    } catch (err) {
      alert("Failed to update profile");
      console.error(err);
    }
  };

  if (!user) return <p>Loading...</p>;

  // Return URL string for image preview or actual Cloudinary URL
  const getImageSrc = () => {
    if (formData.profileImage instanceof File) {
      return URL.createObjectURL(formData.profileImage);
    }
    if (typeof formData.profileImage === "string" && formData.profileImage) {
      return formData.profileImage;
    }
    return "https://via.placeholder.com/150";
  };

  return (
    <>
      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setFullscreenImage(false)}
          style={{ cursor: "zoom-out" }}
          aria-label="Close full screen image"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Escape") setFullscreenImage(false);
          }}
        >
          <img
            src={getImageSrc()}
            alt="Profile Fullscreen"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
          <button
            onClick={() => setFullscreenImage(false)}
            className="absolute top-4 right-4 text-white text-3xl font-bold bg-black bg-opacity-50 rounded px-3 py-1 hover:bg-opacity-80"
            aria-label="Close fullscreen"
            type="button"
          >
            &times;
          </button>
        </div>
      )}

      {!fullscreenImage && (
        <div className="max-w-md mx-auto mt-8 bg-white rounded-lg shadow-md p-6">
          {/* Back button and Header */}
          <div className="flex items-center mb-6">
           
            <h1 className="text-2xl font-semibold text-gray-800 cursor-pointer">My Profile</h1>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="ml-auto text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                aria-label="Edit profile"
              >
                Edit
              </button>
            )}
          </div>

          {/* Profile Image with edit overlay */}
          <div className="flex justify-center mb-8 relative">
            <img
              src={getImageSrc()}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover cursor-pointer border border-gray-300"
              onClick={() => setFullscreenImage(true)}
              title="Click to view full screen"
            />
            {editMode && (
              <label
                htmlFor="profileImage"
                className="absolute bottom-0 right-0 bg-white rounded-full p-1 cursor-pointer border border-gray-300 hover:bg-gray-100"
                title="Change profile picture"
              >
                <PencilSquareIcon className="w-6 h-6 text-gray-700" />
                <input
                  id="profileImage"
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Form */}
          {!editMode ? (
            <div className="space-y-4 text-gray-700">
              <div>
                <label className="block font-semibold mb-1 text-gray-500">
                  Name
                </label>
                <p>{user.username}</p>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-gray-500">
                  Email
                </label>
                <p>{user.email}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block text-gray-600 font-semibold mb-1"
                >
                  Name
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full border text-black border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-gray-600 font-semibold mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border text-black border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-gray-600 font-semibold mb-1"
                >
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Leave blank to keep unchanged"
                  className="w-full border text-black border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-600 font-semibold mb-1"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  className="w-full border text-black border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-between space-x-4">
                <button
                  type="button"
                  onClick={() => setEditMode(false)}
                  className="flex-1 bg-gray-200 text-gray-700 rounded-md py-2 font-semibold hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-md py-2 font-semibold hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </>
  );
}

export default Profile;
