import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-surface/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand */}
          <div className="md:col-span-5 space-y-4">
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Hire<span className="text-accent">Sense</span>
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
              AI-powered recruitment platform connecting top talent with innovative companies. 
              Experience the future of hiring.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://twitter.com" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.15)] transition-all duration-300" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.15)] transition-all duration-300" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="https://github.com" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.15)] transition-all duration-300" aria-label="GitHub">
                <Github className="w-4 h-4" />
              </a>
              <a href="mailto:hello@hiresense.ai" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-accent hover:border-accent/50 hover:shadow-[0_0_15px_rgba(0,255,136,0.15)] transition-all duration-300" aria-label="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-3 md:col-start-7">
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-foreground mb-4">Platform</h3>
            <ul className="space-y-3">
              <li><Link to="/jobs" className="text-muted-foreground hover:text-accent transition-colors text-sm">Browse Jobs</Link></li>
              <li><Link to="/browse" className="text-muted-foreground hover:text-accent transition-colors text-sm">Companies</Link></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-accent transition-colors text-sm">Dashboard</Link></li>
              <li><Link to="/profile" className="text-muted-foreground hover:text-accent transition-colors text-sm">Profile</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="font-display font-semibold text-sm uppercase tracking-wider text-foreground mb-4">Resources</h3>
            <ul className="space-y-3">
              <li><Link to="/resume-analysis" className="text-muted-foreground hover:text-accent transition-colors text-sm">AI Resume Analysis</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-accent transition-colors text-sm">Interview Prep</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-accent transition-colors text-sm">Job Matching</Link></li>
              <li><Link to="/" className="text-muted-foreground hover:text-accent transition-colors text-sm">Help Center</Link></li>
            </ul>
          </div>
        </div>

        <div className="divider-line my-10" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2024 HireSense. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-accent transition-colors">Privacy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms</a>
            <a href="#" className="hover:text-accent transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

