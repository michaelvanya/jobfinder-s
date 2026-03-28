"use client";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import JobCard from "@/Components/JobItem/JobCard";
import { useGlobalContext } from "@/context/globalContext";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import formatMoney from "@/utils/formatMoney";
import { formatDates } from "@/utils/fotmatDates";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { bookmark, bookmarkEmpty } from "@/utils/Icons";

function Page() {
  const { jobs, likeJob, applyToJob } = useJobsContext();
  const { userProfile, isAuthenticated } = useGlobalContext();
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [isLiked, setIsLiked] = React.useState(false);
  const [isApplied, setIsApplied] = React.useState(false);

  const job = jobs.find((job: Job) => job._id === id);
  const otherJobs = jobs.filter((job: Job) => job._id !== id);

  useEffect(() => {
    if (job && userProfile?._id) {
      setIsApplied(job.applicants?.includes(userProfile._id) ?? false);
    }
  }, [job, userProfile?._id]);

  useEffect(() => {
    if (job && userProfile?._id) {
      setIsLiked(job.likes?.includes(userProfile._id) ?? false);
    }
  }, [job, userProfile?._id]);

  if (!job) return null;

  const {
    title,
    location,
    description,
    salary,
    createdBy,
    applicants,
    jobType,
    createdAt,
    salaryType,
    negotiable,
  } = job;

  // FIX: Safe destructure with fallbacks — createdBy can be null
  const name = createdBy?.name ?? "Unknown";
  const profilePicture = createdBy?.profilePicture ?? null;

  const handleLike = (id: string) => {
    setIsLiked((prev) => !prev);
    likeJob(id);
  };

  const handleApply = () => {
    if (!isAuthenticated) {
      router.push("https://jobfindr-q1cl.onrender.com/login");
      return;
    }
    if (isApplied) {
      toast.error("You have already applied to this job");
      return;
    }
    applyToJob(job._id);
    setIsApplied(true);
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      router.push("https://jobfindr-q1cl.onrender.com/login");
      return;
    }
    handleLike(job._id);
  };

  const salaryLabel =
    salaryType === "Yearly"
      ? "pa"
      : salaryType === "Monthly"
      ? "pcm"
      : salaryType === "Weekly"
      ? "pw"
      : salaryType
      ? "ph"
      : "";

  return (
    <main>
      <Header />

      <div className="p-8 mb-8 mx-auto w-[90%] rounded-md flex gap-8">
        <div className="w-[26%] flex flex-col gap-8">
          <JobCard activeJob job={job} />
          {otherJobs.map((job: Job) => (
            <JobCard job={job} key={job._id} />
          ))}
        </div>

        <div className="flex-1 bg-white p-6 rounded-md">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 relative overflow-hidden rounded-md flex items-center justify-center bg-gray-200">
                  <Image
                    src={profilePicture || "/user.png"}
                    alt={name}
                    width={45}
                    height={45}
                    className="rounded-md"
                  />
                </div>
                <div>
                  <p className="font-bold">{name}</p>
                  <p className="text-sm">Recruiter</p>
                </div>
              </div>

              <button
                className={`text-2xl ${
                  isLiked ? "text-[#7263f3]" : "text-gray-400"
                }`}
                onClick={handleBookmark}
                aria-label={isLiked ? "Remove bookmark" : "Bookmark job"}
              >
                {isLiked ? bookmark : bookmarkEmpty}
              </button>
            </div>

            <h1 className="text-2xl font-semibold">{title}</h1>
            <div className="flex gap-4 items-center">
              <p className="text-gray-500">{location}</p>
            </div>

            <div className="mt-2 flex gap-4 justify-between items-center">
              <p className="flex-1 py-2 px-4 flex flex-col items-center justify-center gap-1 bg-green-500/20 rounded-xl">
                <span className="text-sm">Salary</span>
                <span>
                  <span className="font-bold">
                    {formatMoney(salary, "GBP")}
                  </span>
                  <span className="font-medium text-gray-500 text-lg">
                    {salaryLabel ? `/${salaryLabel}` : ""}
                  </span>
                </span>
              </p>

              <p className="flex-1 py-2 px-4 flex flex-col items-center justify-center gap-1 bg-purple-500/20 rounded-xl">
                <span className="text-sm">Posted</span>
                <span className="font-bold">{formatDates(createdAt)}</span>
              </p>

              <p className="flex-1 py-2 px-4 flex flex-col items-center justify-center gap-1 bg-blue-500/20 rounded-xl">
                <span className="text-sm">Applicants</span>
                <span className="font-bold">{applicants?.length ?? 0}</span>
              </p>

              <p className="flex-1 py-2 px-4 flex flex-col items-center justify-center gap-1 bg-yellow-500/20 rounded-xl">
                <span className="text-sm">Job Type</span>
                <span className="font-bold">{jobType?.[0] ?? "N/A"}</span>
              </p>
            </div>

            <h2 className="font-bold text-2xl mt-2">Job Description</h2>
          </div>

          {description ? (
            <div
              className="wysiwyg mt-2"
              dangerouslySetInnerHTML={{ __html: description }}
            />
          ) : (
            <p className="mt-2 text-gray-400">No description provided.</p>
          )}
        </div>

        <div className="w-[26%] flex flex-col gap-8">
          <button
            className={`text-white py-4 rounded-full transition-colors ${
              isApplied
                ? "bg-green-500 cursor-default"
                : "bg-[#7263f3] hover:bg-[#7263f3]/90"
            }`}
            onClick={handleApply}
            disabled={isApplied}
          >
            {isApplied ? "Applied ✓" : "Apply Now"}
          </button>

          <div className="p-6 flex flex-col gap-2 bg-white rounded-md">
            <h3 className="text-lg font-semibold">Other Information</h3>
            <div className="flex flex-col gap-2">
              <p>
                <span className="font-bold">Posted: </span>
                {formatDates(createdAt)}
              </p>
              <p>
                <span className="font-bold">Salary negotiable: </span>
                <span className={negotiable ? "text-green-500" : "text-red-500"}>
                  {negotiable ? "Yes" : "No"}
                </span>
              </p>
              <p>
                <span className="font-bold">Location: </span>
                {location}
              </p>
              <p>
                <span className="font-bold">Job Type: </span>
                {jobType?.[0] ?? "N/A"}
              </p>
            </div>
          </div>

          {job.tags?.length > 0 && (
            <div className="p-6 flex flex-col gap-2 bg-white rounded-md">
              <h3 className="text-lg font-semibold">Tags</h3>
              <p>Other relevant tags for the job position.</p>
              <div className="flex flex-wrap gap-4">
                {job.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-1 rounded-full text-sm font-medium bg-red-500/20 text-red-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.tags?.length > 0 && (
            <div className="p-6 flex flex-col gap-2 bg-white rounded-md">
              <h3 className="text-lg font-semibold">Skills</h3>
              <p>
                This is a full-time position. The successful candidate will be
                responsible for the following:
              </p>
              <div className="flex flex-wrap gap-4">
                {job.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-4 py-1 rounded-full text-sm font-medium bg-indigo-500/20 text-[#7263f3]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default Page;
