import heroBg from "@/assets/hero-bg1.jpg";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate= useNavigate()

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 -z-10">
        <img 
          src={heroBg} 
          alt="Hero background" 
          className="w-full h-full object-cover animate-wave"
        />
        <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
      </div>

      <div className="container mx-auto px-4 mt-{-2}">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 pb-2 bg-gradient-to-r from-hero-from to-hero-to bg-clip-text leading-tight">
            Transform Data into Intelligence
          </h1>

          <p className="text-lg md:text-xl  max-w-2xl mx-auto">
            Automated data modeling, quality checks, and AI-driven insights to reports—all in one unified platform
          </p>
        </div>
         <div className=" mt-5 flex flex-col sm:flex-row gap-4 justify-center">
          <button className ="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 bg-primary hover:bg-primary/90 rounded-md h-14 px-8 bg-gradient-to-r from-[hsl(330,85%,60%)] to-[hsl(280,85%,65%)] hover:from-[hsl(330,85%,55%)] hover:to-[hsl(280,85%,60%)] text-white font-semibold"   onClick={()=>navigate("/auth")}>Get Started →</button>
            {/* <Button
              size="lg"
              onClick={()=>navigate("/auth")}
              className="bg-primary hover:bg-primary/90 h-12 px-8"
            >
              Get Started
            </Button> */}
          </div>
      </div>
    </section>
  );
};

export default HeroSection;
