"use client";

import {
  Activity,
  ArrowRight,
  BarChart3,
  Battery,
  Car,
  Leaf,
  Settings,
  ShoppingBag,
  Sun,
  Zap,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CarbonCalculator() {
  const [_activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[600px] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/img/carbon_calculator_hero_1774805138053.png"
            alt="Windmills on green hills"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent z-10" />
        </div>

        <div className="container mx-auto px-6 relative z-20 max-w-7xl">
          <div className="max-w-2xl space-y-6">
            <nav className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <span className="hover:text-brand-600 cursor-pointer">Home</span>
              <span>/</span>
              <span className="text-slate-900">Carbon Calculator</span>
            </nav>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              Know Your <br />
              <span className="text-brand-500">Carbon Footprint</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
              See how your daily choices impact the planet — from travel to
              electricity — and get tips to reduce your emissions.
            </p>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="relative z-30 -mt-32 pb-24 px-6">
        <div className="container mx-auto max-w-5xl">
          <Card className="border-none shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] rounded-[40px] overflow-hidden bg-white/80 backdrop-blur-2xl">
            <CardContent className="p-0">
              <Tabs
                defaultValue="home"
                onValueChange={setActiveTab}
                className="w-full"
              >
                <div className="border-b border-slate-100 px-6 pt-6">
                  <TabsList className="bg-slate-100/50 p-1.5 h-16 rounded-2xl w-full max-w-2xl mx-auto flex gap-2">
                    <TabsTrigger
                      value="home"
                      className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm h-full gap-2 font-bold"
                    >
                      <Zap className="w-4 h-4" /> Home Energy Use
                    </TabsTrigger>
                    <TabsTrigger
                      value="transport"
                      className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm h-full gap-2 font-bold"
                    >
                      <Car className="w-4 h-4" /> Transportation
                    </TabsTrigger>
                    <TabsTrigger
                      value="lifestyle"
                      className="flex-1 rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm h-full gap-2 font-bold"
                    >
                      <ShoppingBag className="w-4 h-4" /> Lifestyle &
                      Consumption
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-8 md:p-12">
                  <TabsContent
                    value="home"
                    className="mt-0 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Electricity Usage */}
                      <div className="space-y-3">
                        <label
                          htmlFor="electricity-usage"
                          className="text-sm font-bold text-slate-500 uppercase tracking-wider cursor-pointer"
                        >
                          Electricity Usage
                        </label>
                        <div className="flex gap-2">
                          <Input
                            id="electricity-usage" // Matches htmlFor
                            type="number"
                            placeholder="36"
                            className="h-14 rounded-xl border-slate-200 focus:ring-brand-500/20"
                          />
                          <Select defaultValue="monthly">
                            <SelectTrigger className="w-[140px] h-14 rounded-xl border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Natural Gas */}
                      <div className="space-y-3">
                        <label
                          htmlFor="natural-gas"
                          className="text-sm font-bold text-slate-500 uppercase tracking-wider cursor-pointer"
                        >
                          Natural Gas
                        </label>
                        <div className="flex gap-2">
                          <Input
                            id="natural-gas" // Matches htmlFor
                            type="number"
                            placeholder="1.5"
                            className="h-14 rounded-xl border-slate-200 focus:ring-brand-500/20"
                          />
                          <Select defaultValue="daily">
                            <SelectTrigger className="w-[140px] h-14 rounded-xl border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Use Renewables? */}
                      <div className="space-y-3">
                        <label
                          htmlFor="renewables-select"
                          className="text-sm font-bold text-slate-500 uppercase tracking-wider cursor-pointer"
                        >
                          Use Renewables?
                        </label>
                        <Select defaultValue="yes">
                          <SelectTrigger
                            id="renewables-select" // Matches htmlFor
                            className="h-14 rounded-xl border-slate-200"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="yes">
                              Yes, partially or fully
                            </SelectItem>
                            <SelectItem value="no">Not yet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex justify-center pt-8">
                      <Button className="h-16 px-12 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-lg group transition-all">
                        Calculate & Add Footprint
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="transport"
                    className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <div className="text-center py-12 text-slate-400 font-medium">
                      Transportation metrics implementation coming soon...
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="lifestyle"
                    className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
                  >
                    <div className="text-center py-12 text-slate-400 font-medium">
                      Lifestyle metrics implementation coming soon...
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="space-y-4">
              <span className="text-brand-600 font-bold uppercase tracking-[0.2em] text-sm flex items-center gap-2">
                <Leaf className="w-4 h-4" /> Eco Solutions
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                Our Services
              </h2>
              <p className="text-slate-500 max-w-md text-lg">
                Power solutions designed for the planet — and for you. Expert
                guidance at every step of your journey.
              </p>
            </div>
            <Button
              variant="outline"
              className="h-14 px-8 rounded-xl border-slate-200 font-bold hover:bg-slate-100"
            >
              View All Services
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Solar Solutions */}
            <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/img/solar_panels_close_up_1774805500619.png"
                    alt="Solar Panels"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                </div>
                <div className="p-6 space-y-4">
                  <div className="p-3 bg-brand-50 rounded-2xl w-fit">
                    <Sun className="w-6 h-6 text-brand-600" />
                  </div>
                  <h4 className="text-xl font-bold">Solar Solutions</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Custom-designed solar arrays for residential and commercial
                    properties.
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-brand-600 font-bold group"
                  >
                    Learn More{" "}
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* EV Charging */}
            <Card className="group border-none shadow-sm hover:shadow-xl transition-all duration-500 rounded-3xl overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src="/img/ev_charging_station_1774805528638.png"
                    alt="EV Charging"
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="p-6 space-y-4">
                  <div className="p-3 bg-blue-50 rounded-2xl w-fit">
                    <Battery className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="text-xl font-bold">EV Charging</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    State-of-the-art charging infrastructure for your modern
                    electric fleet.
                  </p>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-brand-600 font-bold group"
                  >
                    Learn More{" "}
                    <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Energy Monitoring */}
            <div className="space-y-6">
              <Card className="group border-none shadow-sm hover:shadow-md transition-all rounded-3xl bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 rounded-2xl shrink-0">
                    <Activity className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold">Real-time Stats</h4>
                    <p className="text-slate-500 text-xs">
                      Monitor your consumption 24/7 with precision.
                    </p>
                  </div>
                </div>
              </Card>
              <Card className="group border-none shadow-sm hover:shadow-md transition-all rounded-3xl bg-white p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 rounded-2xl shrink-0">
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold">Technical Help</h4>
                    <p className="text-slate-500 text-xs">
                      Expert support for system maintenance.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Dashboard Preview */}
            <Card className="border-none shadow-xl rounded-3xl bg-slate-900 text-white overflow-hidden relative">
              <div className="p-8 space-y-6 flex flex-col h-full justify-between">
                <div className="space-y-2">
                  <BarChart3 className="w-10 h-10 text-brand-400 mb-4" />
                  <h4 className="text-2xl font-bold">
                    Track Your Monthly Progress
                  </h4>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Get detailed analytics and personalized insights to help you
                    reduce costs.
                  </p>
                </div>
                <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold h-12 rounded-xl">
                  Open Dashboard
                </Button>
              </div>
              {/* Decorative Gradient */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 blur-[80px] rounded-full" />
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Statement */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-brand-950 rounded-[48px] p-8 md:p-20 relative overflow-hidden">
            <div className="max-w-2xl relative z-10 space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                Smaller Footprint, <br />
                <span className="text-brand-400">Brighter Future.</span>
              </h2>
              <p className="text-brand-100/70 text-lg md:text-xl leading-relaxed">
                Join over 10,000 users who have reduced their carbon output by
                an average of 24% in the first year using our smart tools.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button className="h-16 px-10 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold transition-transform hover:scale-105">
                  Get Started Now
                </Button>
                <Button
                  variant="outline"
                  className="h-16 px-10 rounded-2xl border-white/20 text-black hover:bg-white/10 font-bold transition-all"
                >
                  Learn Sustainability Tips
                </Button>
              </div>
            </div>

            {/* Decorative Background Element */}
            <div className="absolute -right-20 -bottom-20 w-[500px] h-[500px] border-[40px] border-brand-500/10 rounded-full" />
            <div className="absolute -right-40 -top-40 w-[400px] h-[400px] bg-brand-500/20 blur-[120px] rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}
