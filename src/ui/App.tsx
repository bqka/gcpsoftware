import { Button } from '@/components/ui/button'
import "@/ui/styles/App.css"

function App() {
  return (
    <div className='h-full w-full'>
      <div className='flex flex-col w-48 gap-4'>
        <Button>Calibrate Camera</Button>
        <Button>New Item</Button>
        <Button>Test Item</Button>
      </div>
    </div>
  )
}

export default App
