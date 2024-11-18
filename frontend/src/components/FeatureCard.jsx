import React from "react";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="flex flex-col items-start p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow bg-white w-1/3 h-[150px]">
      <div className="w-10 h-10">
        {icon}
      </div>
      <div className="flex flex-col items-start">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
