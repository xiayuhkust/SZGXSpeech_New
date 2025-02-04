import { useState } from 'react'
import { FileText } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

function App() {
  const [text, setText] = useState('')
  const [email, setEmail] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }



  const handleTextSubmit = async () => {
    if (!text.trim()) {
      setError('请输入要处理的文本')
      return
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      setError('请输入有效的邮箱地址')
      return
    }

    setIsProcessing(true)
    setError('正在提交处理请求，请稍候...')

    try {
      const formData = new URLSearchParams()
      formData.append('text', text)
      formData.append('email', email.trim())
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 seconds timeout for submission
      
      const response = await fetch('/api/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || '提交失败，请重试')
      }

      setText('')
      setEmail('')
      setError('文本已提交处理，处理完成后结果将发送到您的邮箱。您现在可以关闭此页面。')
    } catch (err: unknown) {
      console.error('Error submitting text:', err)
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('提交超时，请重试')
        } else if (err.message.includes('Failed to fetch')) {
          setError('网络连接错误，请检查网络后重试')
        } else {
          setError(err.message)
        }
      } else {
        setError('提交过程中出现错误')
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">SZGXSpeech初稿制作</h1>
          <p className="text-gray-600 mb-4">
            <span className="block mb-2">请将文本粘贴到下方文本框中进行处理</span>
            <span className="text-sm block">处理20000字约需3分钟，处理完成后结果将发送到您的邮箱</span>
          </p>
          <a 
            href="https://github.com/xiayuhkust/SZGXSpeech_New" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-600 text-sm inline-block mb-4"
          >
            查看项目源码
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={(e) => { e.preventDefault(); handleTextSubmit(); }} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                邮箱地址
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="请输入您的邮箱地址"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={isProcessing}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文本内容
              </label>
              <Textarea
                name="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="请将文本粘贴到此处..."
                className="w-full min-h-[300px] p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 relative z-10"
                disabled={isProcessing}
              />
              <Button
                type="submit"
                className="w-full mt-4"
                disabled={isProcessing}
                onClick={(e) => {
                  e.preventDefault();
                  if (text.trim() && email.trim()) {
                    handleTextSubmit();
                  } else if (!email.trim()) {
                    setError('请输入邮箱地址');
                  } else if (!text.trim()) {
                    setError('请输入要处理的文本');
                  }
                }}
              >
                {isProcessing ? (
                  <span>正在提交文本...</span>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    提交文本并发送到邮箱
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}

export default App
