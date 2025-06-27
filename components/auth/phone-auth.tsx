'use client'

import { useState } from 'react'
import { createClient } from '@lib/supabase/client'
import { Loader2, Phone, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { useTheme } from '@lib/hooks/use-theme'
import { cn } from '@lib/utils'
import { useTranslations } from 'next-intl'

export default function PhoneAuth() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const { isDark } = useTheme()
  const supabase = createClient()
  const t = useTranslations('pages.auth.phoneLogin')

  // --- 发送验证码 ---
  const sendOTP = async () => {
    if (!phone.trim()) {
      toast.error(t('errors.phoneRequired'))
      return
    }

    // 验证手机号格式（中国手机号）
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      toast.error(t('errors.phoneInvalid'))
      return
    }

    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithOtp({
        phone: `+86${phone}`, // 添加中国区号
      })

      if (error) throw error

      toast.success(t('success.otpSent'))
      setStep('otp')
    } catch (error: any) {
      console.error('发送验证码失败:', error)
      toast.error(error.message || t('errors.sendFailed'))
    } finally {
      setLoading(false)
    }
  }

  // --- 验证OTP ---
  const verifyOTP = async () => {
    if (!otp.trim()) {
      toast.error(t('errors.otpRequired'))
      return
    }

    if (otp.length !== 6) {
      toast.error(t('errors.otpInvalid'))
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: `+86${phone}`,
        token: otp,
        type: 'sms',
      })

      if (error) throw error

      toast.success(t('success.verifySuccess'))
      
      // 登录成功后重定向
      window.location.href = '/chat'
    } catch (error: any) {
      console.error('验证失败:', error)
      toast.error(error.message || t('errors.verifyFailed'))
    } finally {
      setLoading(false)
    }
  }

  // --- 重新发送验证码 ---
  const resendOTP = async () => {
    setStep('phone')
    setOtp('')
    await sendOTP()
  }

  return (
    <div className={cn(
      "w-full max-w-md p-6 sm:p-8 space-y-6 sm:space-y-8 rounded-xl shadow-lg border transition-all font-serif",
      isDark ? "bg-stone-900 border-stone-800" : "bg-stone-50 border-stone-200"
    )}>
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-stone-700 to-stone-500 bg-clip-text text-transparent font-serif flex items-center justify-center gap-2">
          <Phone className="h-6 w-6 text-stone-600" />
          {t('title')}
        </h2>
        <p className={cn(
          "mt-2 text-sm font-serif",
          isDark ? "text-gray-400" : "text-gray-600"
        )}>
          {step === 'phone' 
            ? t('subtitle')
            : t('otpSubtitle')
          }
        </p>
      </div>

      <div className="space-y-6">
        {step === 'phone' ? (
          <>
            {/* --- 手机号输入 --- */}
            <div>
              <label htmlFor="phone" className={cn(
                "block text-sm font-medium mb-1 font-serif",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>{t('phoneLabel')}</label>
              <div className="flex">
                <span className={cn(
                  "inline-flex items-center px-3 text-sm border border-r-0 rounded-l-lg font-serif",
                  isDark 
                    ? "bg-stone-800 border-stone-700 text-gray-300" 
                    : "bg-stone-100 border-stone-300 text-gray-600"
                )}>
                  +86
                </span>
                <input
                  id="phone"
                  type="tel"
                  placeholder={t('phonePlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  className={cn(
                    "block w-full px-4 py-3 border rounded-r-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all font-serif",
                    isDark 
                      ? "bg-stone-800 border-stone-700 text-white" 
                      : "bg-white border-stone-300"
                  )}
                  disabled={loading}
                />
              </div>
            </div>

            {/* --- 发送验证码按钮 --- */}
            <button 
              onClick={sendOTP} 
              disabled={loading || !phone.trim()}
              className={cn(
                "w-full h-12 text-base font-serif flex items-center justify-center gap-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                "bg-gradient-to-r from-stone-700 to-stone-600 hover:from-stone-800 hover:to-stone-700 text-white shadow-md hover:shadow-lg"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('sendingButton')}
                </>
              ) : (
                <>
                  <MessageSquare className="h-4 w-4" />
                  {t('sendOtpButton')}
                </>
              )}
            </button>
          </>
        ) : (
          <>
            {/* --- OTP输入 --- */}
            <div>
              <label htmlFor="otp" className={cn(
                "block text-sm font-medium mb-1 font-serif",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>{t('otpLabel')}</label>
              <input
                id="otp"
                type="text"
                placeholder={t('otpPlaceholder')}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className={cn(
                  "block w-full px-4 py-3 border rounded-lg shadow-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition-all font-serif text-center text-lg tracking-widest",
                  isDark 
                    ? "bg-stone-800 border-stone-700 text-white" 
                    : "bg-white border-stone-300"
                )}
                disabled={loading}
                maxLength={6}
              />
              <p className={cn(
                "mt-1 text-sm font-serif",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {t('otpSentTo', { phone })}
              </p>
            </div>

            {/* --- 验证按钮 --- */}
            <button 
              onClick={verifyOTP} 
              disabled={loading || otp.length !== 6}
              className={cn(
                "w-full h-12 text-base font-serif flex items-center justify-center gap-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                "bg-gradient-to-r from-stone-700 to-stone-600 hover:from-stone-800 hover:to-stone-700 text-white shadow-md hover:shadow-lg"
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t('verifyingButton')}
                </>
              ) : (
                t('verifyButton')
              )}
            </button>

            {/* --- 重新发送 --- */}
            <button 
              onClick={resendOTP}
              disabled={loading}
              className={cn(
                "w-full h-10 text-sm font-serif rounded-lg border transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                isDark 
                  ? "border-stone-700 text-gray-300 hover:bg-stone-800" 
                  : "border-stone-300 text-gray-700 hover:bg-stone-50"
              )}
            >
              {t('resendButton')}
            </button>

            {/* --- 返回修改手机号 --- */}
            <button 
              onClick={() => setStep('phone')}
              disabled={loading}
              className={cn(
                "w-full h-10 text-sm font-serif rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                isDark 
                  ? "text-gray-400 hover:text-gray-300 hover:bg-stone-800" 
                  : "text-gray-600 hover:text-gray-700 hover:bg-stone-50"
              )}
            >
              {t('changePhoneButton')}
            </button>
          </>
        )}
      </div>
    </div>
  )
} 