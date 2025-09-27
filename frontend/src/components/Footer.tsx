import React from "react";
import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  X,
} from "lucide-react";
import Image from "next/image";
const Footer = () => {
  return (
    <div className="w-full px-6 sm:px-8 lg:px-12 flex flex-col md:flex-row justify-between py-8 lg:py-12 gap-12">
      <div>
        <Link href="/" className="text-2xl font-bold text-gray-800 font-mono">
          SYNAPSE
        </Link>
        <p className="text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} Synapse, Ilorin, Kwara State.
        </p>
        <div className="flex space-x-2 mt-2">
          <Link href="https://www.instagram.com/" passHref>
            <Instagram className="w-4 h-4 text-gray-500" />
          </Link>
          <Link href="https://twitter.com/" passHref>
            <Twitter className="w-4 h-4 text-gray-500" />
          </Link>
          <Link href="https://www.linkedin.com/" passHref>
            <Linkedin className="w-4 h-4 text-gray-500" />
          </Link>
          <Link href="https://www.youtube.com/" passHref>
            <Youtube className="w-4 h-4 text-gray-500" />
          </Link>
          <Link href="https://www.facebook.com/" passHref>
            <Facebook className="w-4 h-4 text-gray-500" />
          </Link>
          <Link href="#" passHref>
            <Image
              src={"/x.svg"}
              alt="x"
              width={16}
              height={16}
              className="w-4 h-4 text-gray-500"
            />
          </Link>
        </div>
      </div>

      <div className="flex md:justify-end gap-8">
        <div className="flex flex-col space-y-3">
          <Link href="/" className="text-gray-800 text-sm">
            Privacy Policy
          </Link>
          <Link href="/" className="text-gray-800 text-sm">
            Terms of Service
          </Link>
          <Link href="/" className="text-gray-800 text-sm">
            Contact
          </Link>
        </div>
        <div className="flex flex-col space-y-3">
          <Link href="/" className="text-gray-800 text-sm">
            Privacy Policy
          </Link>
          <Link href="/" className="text-gray-800 text-sm">
            Terms of Service
          </Link>
          <Link href="/" className="text-gray-800 text-sm">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer;
