import React from "react";
import { motion } from "framer-motion";
import heroImg01 from "../assets/images/heroimagee1.png";
import heroImg02 from "../assets/images/heroimagee2.png";
import heroImg03 from "../assets/images/heroimageee3.png";

const Home = () => {
  return (
    <>
      {/* ======= HERO SECTION ======= */}
      <motion.div
        className="hero min-h-screen"
        style={{
          backgroundImage:
            "url(https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?cs=srgb&dl=pexels-asadphoto-1268855.jpg&fm=jpg)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="hero-overlay bg-opacity-60"></div>
        <motion.div
          className="hero-content text-neutral-content text-center"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <motion.div className="max-w-md" animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <h1 className="mb-5 text-5xl font-bold">Hello there</h1>
            <p className="mb-5">
              Explore breathtaking destinations and indulge in unforgettable experiences. 
              Discover hidden gems and embrace new adventures. Your journey to paradise awaits you.
            </p>
            <motion.button
              className="btn btn-primary"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              Get Started
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* ======= HERO CONTENT ======= */}
      <section className="hero__section pt-[60px] 2xl:h-[800px]">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-[90px] items-center justify-between">
            {/* Left Side Content */}
            <motion.div
              className="lg:w-[570px]"
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h1 className="text-[36px] leading-[46px] text-headingColor font-[800] md:text-[60px] md:leading-[70px]">
                Discover your next adventure with unforgettable experiences...
              </h1>
              <button className="btn mt-5">Make a call</button>

              {/* Animated Counters */}
              <motion.div
                className="mt-[30px] lg:mt-[70px] flex flex-col lg:flex-row lg:items-center gap-5 lg:gap-[30px]"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                {[
                  { value: "10+", label: "Years of Experience", color: "bg-yellowColor" },
                  { value: "20+", label: "Travel Destinations", color: "bg-purpleColor" },
                  { value: "100%", label: "Client Satisfaction", color: "bg-irisBlueColor" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-[36px] lg:text-[44px] font-[700] text-headingColor">
                      {item.value}
                    </h2>
                    <span className={`w-[100px] h-2 ${item.color} rounded-full block mt-[-14px]`}></span>
                    <p className="text__para">{item.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Image Section with 3D Hover Effects */}
            <motion.div
              className="flex flex-col lg:flex-row items-center gap-[30px] justify-end"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.div
                className="w-full lg:w-auto lg:mr-[30px] flex justify-center lg:block"
                whileHover={{ rotateY: 10, scale: 1.05 }}
                transition={{ duration: 0.4 }}
              >
                <img className="w-full h-auto max-h-[500px]" src={heroImg01} alt="" />
              </motion.div>

              <motion.div className="flex flex-col gap-[30px]">
                <motion.img
                  className="w-full h-auto"
                  src={heroImg02}
                  alt=""
                  whileHover={{ rotateY: -10, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
                <motion.img
                  className="w-full h-auto"
                  src={heroImg03}
                  alt=""
                  whileHover={{ rotateY: 10, scale: 1.05 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
