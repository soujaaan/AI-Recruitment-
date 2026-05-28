import React, { useEffect } from 'react'
import Navbar from './shared/Navbar'
import HeroSection from './HeroSection'
//import DualAuthSection from './auth/DualAuthSection'
import CategoryCarousel from './CategoryCarousel'
import LatestJobs from './LatestJobs'
import Footer from './shared/Footer'
import useGetAllJobs from '@/hooks/useGetAllJobs'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getDashboardPath } from '@/utils/authRedirect'

const Home = () => {
  useGetAllJobs({ page: 1, limit: 6 });
  const { user } = useSelector(store => store.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.role) {
      navigate(getDashboardPath(user.role));
    }
  }, [navigate, user?.role]);

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <Navbar />
      <HeroSection />
     <CategoryCarousel />
      <LatestJobs />
      <Footer />
    </div>
  )
}

export default Home

