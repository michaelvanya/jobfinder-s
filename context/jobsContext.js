"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useGlobalContext } from "./globalContext";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const JobsContext = createContext();

axios.defaults.baseURL = "https://jobfinder-mze7.onrender.com";
axios.defaults.withCredentials = true;

export const JobsContextProvider = ({ children }) => {
  const { userProfile } = useGlobalContext(); // ✅ removed getUserProfile — doesn't belong here
  const router = useRouter();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userJobs, setUserJobs] = useState([]);

  const [searchQuery, setSearchQuery] = useState({
    tags: "",
    location: "",
    title: "",
  });

  const [filters, setFilters] = useState({
    fullTime: false,
    partTime: false,
    internship: false,
    contract: false,
    fullStack: false,
    backend: false,
    devOps: false,
    uiux: false,
  });

  const [minSalary, setMinSalary] = useState(30000);
  const [maxSalary, setMaxSalary] = useState(120000);

  const getJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/jobs");
      setJobs(res.data ?? []); // ✅ fallback to empty array if null
    } catch (error) {
      console.log("Error getting jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const createJob = async (jobData) => {
    try {
      const res = await axios.post("/api/v1/jobs", jobData);

      if (!res.data) return; // ✅ guard against null response

      toast.success("Job created successfully");
      setJobs((prevJobs) => [res.data, ...prevJobs]);

      if (userProfile?._id) {
        setUserJobs((prevUserJobs) => [res.data, ...prevUserJobs]);
        await getUserJobs(userProfile._id);
      }

      await getJobs();
      router.push(`/job/${res.data._id}`);
    } catch (error) {
      console.log("Error creating job", error);
      toast.error(error?.response?.data?.message || "Failed to create job");
    }
  };

  const getUserJobs = async (userId) => {
    if (!userId) return; // ✅ guard against undefined/null userId
    setLoading(true);
    try {
      const res = await axios.get("/api/v1/jobs/user/" + userId);
      setUserJobs(res.data ?? []); // ✅ fallback to empty array if null
    } catch (error) {
      console.log("Error getting user jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const searchJobs = async (tags, location, title) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (tags) query.append("tags", tags);
      if (location) query.append("location", location);
      if (title) query.append("title", title);

      const res = await axios.get(`/api/v1/jobs/search?${query.toString()}`);
      setJobs(res.data ?? []); // ✅ fallback to empty array if null
    } catch (error) {
      console.log("Error searching jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const getJobById = async (id) => {
    if (!id) return null; // ✅ guard against undefined/null id
    setLoading(true);
    try {
      const res = await axios.get(`/api/v1/jobs/${id}`);
      return res.data ?? null;
    } catch (error) {
      console.log("Error getting job by id", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const likeJob = async (jobId) => {
    if (!jobId) return; // ✅ guard
    try {
      await axios.put(`/api/v1/jobs/like/${jobId}`);
      toast.success("Job liked successfully");
      getJobs();
    } catch (error) {
      console.log("Error liking job", error);
      toast.error(error?.response?.data?.message || "Failed to like job");
    }
  };

  const applyToJob = async (jobId) => {
    if (!jobId) return; // ✅ guard

    const job = jobs.find((job) => job._id === jobId);

    if (job && userProfile?._id && job.applicants?.includes(userProfile._id)) { // ✅ optional chain applicants
      toast.error("You have already applied to this job");
      return;
    }

    try {
      await axios.put(`/api/v1/jobs/apply/${jobId}`);
      toast.success("Applied to job successfully");
      getJobs();
    } catch (error) {
      console.log("Error applying to job", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const deleteJob = async (jobId) => {
    if (!jobId) return; // ✅ guard
    try {
      await axios.delete(`/api/v1/jobs/${jobId}`);
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      setUserJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      toast.success("Job deleted successfully");
    } catch (error) {
      console.log("Error deleting job", error);
      toast.error(error?.response?.data?.message || "Failed to delete job");
    }
  };

  const handleSearchChange = (searchName, value) => {
    setSearchQuery((prev) => ({ ...prev, [searchName]: value }));
  };

  const handleFilterChange = (filterName) => {
    setFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  useEffect(() => {
    getJobs();
  }, []);

  useEffect(() => {
    if (userProfile?._id) {
      getUserJobs(userProfile._id);
      // ✅ removed getUserProfile() call — was causing re-render loop and null crash
    }
  }, [userProfile?._id]); // ✅ depend on _id only, not the whole object — prevents unnecessary re-renders

  return (
    <JobsContext.Provider
      value={{
        jobs,
        loading,
        createJob,
        userJobs,
        searchJobs,
        getJobById,
        likeJob,
        applyToJob,
        deleteJob,
        handleSearchChange,
        searchQuery,
        setSearchQuery,
        handleFilterChange,
        filters,
        minSalary,
        setMinSalary,
        maxSalary,
        setMaxSalary,
        setFilters,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};

export const useJobsContext = () => useContext(JobsContext);
