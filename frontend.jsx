import "./styles.css";
import react, {useState} from 'react'
export default function App() {
  const [base64,setBase64]=useState("")

  const onChange=(e)=>{
     const files= e.target.files
     const file=files[0]
     getBase64(file)
  }
  const onLoad=(fileString)=>{
    setBase64(fileString)
  }

 const getBase64=(file)=>{
  let reader=new FileReader()
  reader.readAsDataURL(file)
  reader.onload=()=>{
    onLoad(reader.result)
  }
  }

  const handleSubmit=(e)=>{
    e.preventDefault()
    fetch("https://v79562j00j.execute-api.ap-southeast-2.amazonaws.com/dev/send-report",{
      mode:"no-cors",
      method:"POST",
      headers:{
        Accept:"application/json",
        "Content-Type":"application/json",
      },
      body: JSON.stringify({
        senderName:"santosh7381070816@gmail.com",
        senderEmail:"santosh7381070816@gmail.com",
        message:"hello from santosh",
        base64Data:base64,
        date:new Date(),
        fileName:"TEST_FILE_NAME",
      }),
    })
  }
  return (
    <div className="App">
    <form>
      <input type="file" accept="application/pdf" onChange={onChange}/>
    </form>
    <button onClick={handleSubmit}>send</button>
    </div>
  );
}
