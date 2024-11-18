import React from "react";
import { Link } from "react-router-dom";
import FeatureCard from "../components/FeatureCard";
import { MdAnalytics } from "react-icons/md";
import { TbReportSearch } from "react-icons/tb";
import { FaUserCheck } from "react-icons/fa6";
import img1 from "../assets/img1.png";
import img2 from "../assets/img2.png";
import img3 from "../assets/img3.png";

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen w-3/4 mx-auto mt-10">
      {/* hero section */}
      <section className="flex flex-col items-center mt-5">
        <div className="text-center text-6xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-cyan-500 p-2">
          Innovative Health <br />
          Diagnostics at Your <br /> Fingertips
        </div>
        <p className="w-2/3 text-center mt-5 text-gray-700">
          Unlock cutting-edge health insights with{" "}
          <span className="text-blue-700 font-medium">Thermo-Insights!</span>{" "}
          Analyze thermal images for health
          <span className="text-blue-700 font-medium"> diagnostics</span>,
          generate detailed
          <span className="text-blue-700 font-medium"> reports</span>, and
          convert images to color{" "}
          <span className="text-blue-700 font-medium">heatmaps</span>. Try now!
        </p>
        <Link to={"/service"}>
          <button className="mt-5 rounded-full bg-blue-500 hover:bg-blue-700 w-[100%] text-white py-2 px-4">
            Try it Free Now!
          </button>
        </Link>
      </section>

      {/* 2nd section features*/}
      <section className="mt-5 w-3/4 flex flex-row gap-5 items-center">
        <FeatureCard
          icon={<MdAnalytics className="w-8 h-8 text-blue-800" />}
          title="Advanced Analysis"
          description="Efficient thermal health diagnostics"
        />
        <FeatureCard
          icon={<TbReportSearch className="w-8 h-8 text-blue-800" />}
          title="Customized Reports"
          description="Personalized detailed analysis reports"
        />
        <FeatureCard
          icon={<FaUserCheck className="w-8 h-8 text-blue-800" />}
          title="User Friendly Interface"
          description="Easily upload, input and download"
        />
      </section>

      {/* about section */}

      <section className="flex flex-col items-center mt-10">
        <div className="text-center text-4xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-cyan-500 p-2">
          Unleash Your Health Potential <br /> with Thermo-Insights' <br />
          Innovative Analysis
        </div>
        <p className="w-2/3 text-center text-sm mt-5 text-gray-700">
          Thermo-Insights revolutionizes health diagnostics by providing quick,
          detailed thermal image analysis, empowering users with valuable
          insights for better health decisions and outcomes
        </p>

        <div className="w-3/4 flex flex-row items-center justify-between mt-12">
          <div className="w-[50%]">
            <img src={img1} className="rounded-xl" />
          </div>

          <div className="w-2/5 flex flex-col items-start gap-5 p-3">
            <h1 className="font-semibold text-xl">
              Revolutionizing Health Diagnostics with Thermo-Insights
            </h1>
            <p className="text-sm text-gray-700">
              Thermo-Insights leverages cutting-edge technology to analyze
              thermal images efficiently, providing a seamless platform for
              users to receive detailed analysis reports promptly,
              revolutionizing health diagnostics
            </p>
          </div>
        </div>

        <div className="w-3/4 flex flex-row items-center justify-between mt-12">

          <div className="w-2/5 flex flex-col items-start gap-5 p-3">
            <h1 className="font-semibold text-xl">
            Streamlined Thermal Analysis for Healthcare
            </h1>
            <p className="text-sm text-gray-700">
            Thermo-Insights simplifies thermal image analysis for healthcare professionals, enabling quick and accurate decisions, enhancing diagnostics, and improving patient care effectively and efficiently
            </p>
          </div>

          <div className="w-[50%]">
            <img src={img2} className="rounded-xl" />
          </div>
        </div>

        <div className="w-3/4 flex flex-row items-center justify-between mt-12">
          <div className="w-[50%]">
            <img src={img3} className="rounded-xl" />
          </div>

          <div className="w-2/5 flex flex-col items-start gap-5 p-3">
            <h1 className="font-semibold text-xl">
            Enhanced Thermal Image Analysis Tool
            </h1>
            <p className="text-sm text-gray-700">
            Thermo-Insights stands out with its unique ability to convert greyscale images into colored heatmaps, enhancing visualization for users and offering advanced analytical capabilities for improved thermal image analysis
            </p>
          </div>
        </div>
      </section>

{/* last section */}
      <section className="flex items-center justify-center mt-10 bg-blue-500 rounded-2xl w-2/3">
      <div className=" text-center rounded-lg p-8 max-w-lg">
        <h1 className="text-white text-3xl font-bold mb-4">
          Transforming Thermal Images into Health Insights Today!
        </h1>
        <p className="text-white text-lg mb-6">
          Unlock Your Health Insights Now 🔥
        </p>
        <Link to={"/service"}>
        <button className="bg-white text-blue-500 px-6 py-2 rounded-full font-medium hover:bg-gray-100 transition">
          Try Now
        </button>
        </Link>
      </div>
    </section>
    </div>
  );
}
