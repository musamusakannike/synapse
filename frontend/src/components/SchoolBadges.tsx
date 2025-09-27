import React from "react";
import Image from "next/image";

const badges = [
  {
    name: "University of Ilorin",
    src: "/unilorin.png",
    width: 160,
    height: 160,
  },
  {
    name: "Kwara State University",
    src: "/kwasu.jpg",
    width: 160,
    height: 160,
  },
  {
    name: "AlHikmah University",
    src: "/alhikma.jpeg",
    width: 160,
    height: 160,
  },
];

const SchoolBadges: React.FC = () => {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-wider text-gray-500">
            Loved by students at
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-2">
            Nigerian universities using Synapse
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 md:gap-12 items-center">
          {badges.map((b) => (
            <div
              key={b.name}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shadow-sm overflow-hidden">
                <Image
                  src={b.src}
                  alt={`${b.name} badge`}
                  width={b.width}
                  height={b.height}
                  className="object-contain p-3 grayscale hover:grayscale-0 transition duration-200"
                />
              </div>
              <span className="mt-3 text-sm font-medium text-gray-700">
                {b.name}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Badges are used for identification only and do not imply endorsement.
        </p>
      </div>
    </section>
  );
};

export default SchoolBadges;
