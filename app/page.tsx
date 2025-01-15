"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/navbar";
import ScrollToTop from "@/components/helper/scroll-to-top";
import MobileNav from "@/components/mobile-nav";
import Footer from "@/components/footer";
import { useEffect, useState } from "react";
import { MultiStepLoader } from "@/components/helper/loader";
import { subscribeUser, unsubscribeUser, sendNotification } from '@/app/actions'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

const HeroSection = dynamic(() => import("@/components/homepage/hero-section"));
const AboutSection = dynamic(() => import("@/components/homepage/about"));
const Experience = dynamic(() => import("@/components/homepage/experience"));
const Skills = dynamic(() => import("@/components/homepage/skills"));
const Projects = dynamic(() => import("@/components/homepage/projects"));
const Education = dynamic(() => import("@/components/homepage/education"));
const RepositoryPage = dynamic(() => import("@/components/homepage/repository"));
const ContactSection = dynamic(() => import("@/components/homepage/contact"));
const Certificate = dynamic(() => import("@/components/homepage/certificate"));

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  const loaderDuration = 9 * 200;

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), loaderDuration);
    return () => clearTimeout(timer);
  }, [loaderDuration]);

  if (isLoading) {
    return <MultiStepLoader initialLoading={isLoading} />;
  }



  return (
    <>
      <div>
        <PushNotificationManager />
        <InstallPrompt />
      </div >
      <main className="min-h-screen relative z-40 mx-auto px-6 sm:px-12 lg:max-w-[70rem] xl:max-w-[76rem] 2xl:max-w-[92rem] text-white">
        <Navbar />
        <div suppressHydrationWarning>
          <HeroSection />
          <AboutSection />
          <Experience />
          <Skills />
          <Projects />
          <Education />
          <Certificate />
          <RepositoryPage />
          <ContactSection />
        </div>
        <ScrollToTop />
      </main>
      <MobileNav />
      <Footer />
    </>
  );
}

function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false)
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  )
  const [message, setMessage] = useState('')

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      registerServiceWorker()
    }
  }, [])

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    })
    const sub = await registration.pushManager.getSubscription()
    setSubscription(sub)
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      ),
    })
    setSubscription(sub)
    const serializedSub = JSON.parse(JSON.stringify(sub))
    await subscribeUser(serializedSub)
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe()
    setSubscription(null)
    await unsubscribeUser()
  }

  async function sendTestNotification() {
    if (subscription) {
      await sendNotification(message)
      setMessage('')
    }
  }

  if (!isSupported) {
    return <p>Push notifications are not supported in this browser.</p>
  }

  return (
    <div>
      <h3>Push Notifications</h3>
      {subscription ? (
        <>
          <p>You are subscribed to push notifications.</p>
          <button onClick={unsubscribeFromPush}>Unsubscribe</button>
          <input
            type="text"
            placeholder="Enter notification message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button onClick={sendTestNotification}>Send Test</button>
        </>
      ) : (
        <>
          <p>You are not subscribed to push notifications.</p>
          <button onClick={subscribeToPush}>Subscribe</button>
        </>
      )}
    </div>
  )
}

function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    setIsIOS(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    )

    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
  }, [])

  if (isStandalone) {
    return null // Don't show install button if already installed
  }

  return (
    <div>
      <h3>Install App</h3>
      <button>Add to Home Screen</button>
      {isIOS && (
        <p>
          To install this app on your iOS device, tap the share button
          <span role="img" aria-label="share icon">
            {' '}
            ⎋{' '}
          </span>
          and then &quot;Add to Home Screen&quot;
          <span role="img" aria-label="plus icon">
            {' '}
            ➕{' '}
          </span>.
        </p>
      )}
    </div>
  )
}
