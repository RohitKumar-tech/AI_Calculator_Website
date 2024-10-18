import { useEffect, useRef, useState } from "react";
import { SWATCHES } from '@/constants'; 
import { ColorSwatch , Group } from '@mantine/core';
import {Button} from '@/components/ui/button';
import axios from 'axios';

interface Response {
    expr : string;
    result : string;
    assign: boolean;
}

interface GeneratedResult {
    expression : string;
    answer: string;
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color , setColor] = useState('rgb(255,255,255)');
    const [reset , setReset] = useState(false);
    const [result , setResult] = useState<GeneratedResult>();
    const [dictOfVars , setDictOfVars] = useState({});

    useEffect(() => {
        if(reset) {
            resetCanvas();
            setReset(false);
        }
    } , [reset]);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Set canvas dimensions to match the window size
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
                ctx.lineCap = 'round';
                ctx.lineWidth = 3;
            }
        }
    } ,[] );

    const sendData = async () => {
        const canvas = canvasRef.current;

        if(canvas) {
            const response = await axios({
                method: 'post',
                url: `${import.meta.env.VITE_API_URL}/calculate`,
                data: {
                    image: canvas.toDataURL('image/png'),
                    dictOfVars: dictOfVars,
                }
            });

            const resp = await response.data;
            console.log('Response: ',resp);
        }
    }

    const resetCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.style.background = 'black';
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                setIsDrawing(true);
            }
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;

        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = color;
                ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                ctx.stroke();
            }
        }
    };

    return (
        <>
        <div className="grid grid-cols-3 gap-2">
            <button
                onClick = {() => setReset(true)}
                className = 'z-20 bg-black text-white'
                data-variant = 'default'
                data-color = "black"
            >
                Reset
            </button>
            <Group className="z-20">
                {SWATCHES.map((swatchcolor: string) => {
                    return (
                        <ColorSwatch
                            key = {swatchcolor}
                            color = {swatchcolor}
                            onClick = {() => setColor(swatchcolor)}
                        />
                    );
                })}
            </Group>
            <button
                onClick = {sendData}
                className = 'z-20 bg-black text-white'
                data-variant = 'default'
                data-color = "black"
            >
                Calculate
            </button>

        </div>
            <canvas
                ref={canvasRef}
                id='canvas'
                className='absolute top-0 left-0 w-full h-full'
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
            />
        </>
    );
}