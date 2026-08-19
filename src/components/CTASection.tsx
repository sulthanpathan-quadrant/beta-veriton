// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";
 
// const CTASection = () => {
//   const navigate = useNavigate()
//   const handleStartTrial = () => {
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//   };
 
//   const handleRequestDemo = () => {
//     window.location.href = "mailto:contact@veritasai.com?subject=Demo Request";
//   };
 
//   return (
//     <section className="py-20 bg-feature-bg">
//       <div className="container mx-auto px-4">
//         <div className="max-w-3xl mx-auto text-center animate-fade-in">
//           <h2 className="text-4xl md:text-5xl font-bold mb-6">
//             Ready to Transform Your Data?
//           </h2>
//           <p className="text-xl text-muted-foreground mb-8">
//             Join leading teams who are building faster, more reliable data pipelines. Start your free trial today and experience the future of data automation.
//           </p>
 
//           <div className="flex flex-col sm:flex-row gap-4 justify-center">
//             <Button
//               size="lg"
//               onClick={()=>navigate("/auth")}
//               className="bg-primary hover:bg-primary/90 h-12 px-8"
//             >
//               Start Free Trial
//             </Button>
//             <Button
//               size="lg"
//               variant="secondary"
//               onClick={()=> navigate("/auth")}
//               className="h-12 px-8"
//             >
//               Request a Demo
//             </Button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };
 
// export default CTASection;
 
 


 
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils"; // ← make sure you have this utility (comes with shadcn)
 
// import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

const CTASection = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
 
  const handleStartTrial = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    // or: navigate("/signup") etc.
  };
 
  return (
    <section className="py-20 bg-feature-bg">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your Data?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join leading teams who are building faster, more reliable data pipelines.
            Start your free trial today and experience the future of data automation.
          </p>
 
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={()=> navigate("/auth")}
              className="bg-primary hover:bg-primary/90 h-12 px-8"
            >
              Start Free Trial
            </Button>

           
 
            <Dialog open={open} onOpenChange={setOpen}>
               
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  variant="link1"
                  className="h-12 px-8"
                >
                  Request a Demo
                </Button>
                 
              </DialogTrigger>
 
              <DialogContent
                className={cn(
                  // Responsive width: almost full on mobile, capped on larger screens
                  "w-full max-w-[95vw] sm:max-w-[min(600px,95vw)] md:max-w-[620px]",
                  // Allow scrolling when content is long
                  "max-h-[90vh] overflow-y-auto",
                  // Better padding & rounded corners
                  "p-6 sm:p-8",
                  "gap-0" // removes default gap if unwanted
                )}
              >
                {/* Header part – no bottom padding needed here */}
                <DialogHeader className="text-left mb-6 sm:mb-8">
                   
                  <div className="flex justify-between">
                  <DialogTitle className="text-2xl sm:text-3xl font-bold">
                    Request a demo
                  </DialogTitle>
              <Button variant="link" size="icon" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
              </div>
                </DialogHeader>
 
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        Work Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your business email"
                        required
                      />
                    </div>
 
                    <div className="space-y-2">
                      <Label htmlFor="role">
                        Role <span className="text-red-500">*</span>
                      </Label>
                      <Select required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">Engineering / Developer</SelectItem>
                          <SelectItem value="product">Product Manager</SelectItem>
                          <SelectItem value="data">Data / Analytics Lead</SelectItem>
                          <SelectItem value="executive">Executive</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
 
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Phone Number w/ Country Code"
                      required
                    />
                  </div>
 
                  <div className="space-y-2">
                    <Label htmlFor="message">Anything Else?</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us more about your project, needs and timeline"
                      rows={4}
                    />
                  </div>
 
                  {/* <div className="flex items-start space-x-2 pt-2">
                    <Checkbox id="marketing" />
                    <Label
                      htmlFor="marketing"
                      className="text-sm leading-tight cursor-pointer"
                    >
                      Yes, I'd like to receive marketing communications regarding
                      VeritasAI products, services, and events. I can unsubscribe at
                      any time.
                    </Label>
                  </div>  */}
 
                  <p className="text-xs text-muted-foreground pt-1">
                    By clicking the submit button, you agree to allow VeritasAI to
                    store and process the information above for contact purposes.
                    Please read our{" "}
                    <a href="/privacy" className="underline hover:text-primary">
                      Privacy Policy
                    </a>.
                  </p>
 
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white h-12 text-base sm:text-lg mt-2"
                  >
                    Submit
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </section>
  );
};
 
export default CTASection;
 