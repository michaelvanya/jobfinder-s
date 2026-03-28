"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar } from "lucide-react";

import { useGlobalContext } from "@/context/globalContext";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import { Separator } from "../ui/separator";
import formatMoney from "@/utils/formatMoney";
import { formatDates } from "@/utils/fotmatDates";
import { bookmark, bookmarkEmpty } from "@/utils/Icons";

interface JobProps {
  job: Job;
  activeJob?: boolean;
}

function JobCard({ job, activeJob = false }: JobProps) {
  const { likeJob } = useJobsContext();
  const { userProfile, isAuthenticated } = useGlobalContext();
  const router = useRouter();
  const [isLiked, setIsLiked] = React.useState(false);

  const {
    _id,
    title,
    salaryType,
    salary,
    createdBy,
    applicants = [],
    jobType = [],
    createdAt,
    description = "",
    location = "",
    likes = [],
  } = job;

  useEffect(() => {
    if (userProfile?._id) {
      setIsLiked(likes.includes(userProfile._id));
    } else {
      setIsLiked(false);
    }
  }, [likes, userProfile?._id]);

  const handleLike = (id: string) => {
    setIsLiked((prev) => !prev);
    likeJob(id);
  };

  const plainDescription = description.replace(/<[^>]+>/g, "").trim();
  const truncatedDescription =
    plainDescription.length > 100
      ? `${plainDescription.slice(0, 100)}...`
      : plainDescription;

  const jobTypeBg = (type: string) => {
    const normalized = type.toLowerCase().replace("-", " ").trim();

    switch (normalized) {
      case "full time":
        return "bg-green-500/20 text-green-600";
      case "part time":
        return "bg-purple-500/20 text-purple-600";
      case "contract":
        return "bg-red-500/20 text-red-600";
      case "internship":
        return "bg-indigo-500/20 text-indigo-600";
      case "remote":
        return "bg-blue-500/20 text-blue-600";
      default:
        return "bg-gray-500/20 text-gray-600";
    }
  };

  const formatSalaryType = (type: string) => {
    const normalized = type.toLowerCase();
    if (normalized.includes("year")) return "pa";
    if (normalized.includes("month")) return "pcm";
    if (normalized.includes("week")) return "pw";
    return "ph";
  };

  return (
    <div
      className={`p-8 rounded-xl flex flex-col gap-5 ${
        activeJob ? "bg-gray-50 shadow-md border-b-2 border-[#7263f3]" : "bg-white"
      }`}
    >
      <div className="flex justify-between gap-4">
        <div
          className="group flex gap-3 items-center cursor-pointer"
          onClick={() => router.push(`/job/${_id}`)}
        >
          <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center overflow-hidden shrink-0">
            {createdBy?.profilePicture ? (
              <Image
                src={createdBy.profilePicture}
                alt={createdBy.name || "User"}
                width={40}
                height={40}
                className="rounded-md object-cover"
              />
            ) : (
              <Image
                src="/user.png"
                alt="User"
                width={40}
                height={40}
                className="rounded-md object-cover"
              />
            )}
          </div>

          <div className="flex flex-col gap-1 min-w-0">
            <h4 className="group-hover:underline font-bold truncate">
              {title}
            </h4>

            <p className="text-xs text-gray-500">
              {createdBy?.name ? (
                <>
                  {createdBy.name} &bull; {applicants.length}{" "}
                  {applicants.length === 1 ? "Applicant" : "Applicants"}
                </>
              ) : (
                <>
                  {applicants.length}{" "}
                  {applicants.length === 1 ? "Applicant" : "Applicants"}
                </>
              )}
            </p>
          </div>
        </div>

        <button
          className={`text-2xl ${isLiked ? "text-[#7263f3]" : "text-gray-400"}`}
          onClick={() =>
            isAuthenticated ? handleLike(_id) : router.push("/login")
          }
        >
          {isLiked ? bookmark : bookmarkEmpty}
        </button>
      </div>

      {jobType.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {jobType.map((type, index) => (
            <span
              key={`${type}-${index}`}
              className={`py-1 px-3 text-xs font-medium rounded-md border ${jobTypeBg(type)}`}
            >
              {type}
            </span>
          ))}
        </div>
      )}

      {plainDescription && (
        <p className="text-sm text-gray-600">{truncatedDescription}</p>
      )}

      {location && <p className="text-xs text-gray-400">{location}</p>}

      <Separator />

      <div className="flex justify-between items-center gap-6">
        <p>
          <span className="font-bold">{formatMoney(salary, "GBP")}</span>
          <span className="font-medium text-gray-400 text-lg">
            /{formatSalaryType(salaryType || "Month")}
          </span>
        </p>

        {createdAt && (
          <p className="flex items-center gap-2 text-sm text-gray-400">
            <Calendar size={16} />
            Posted: {formatDates(createdAt)}
          </p>
        )}
      </div>
    </div>
  );
}

export default React.memo(JobCard);
