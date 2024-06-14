export default function ProgressBarX({curVal, endVal, unit = 'SOL'}) {
    const percent = (100 * curVal / endVal).toFixed(0);
    console.log("percent: ", percent);
    return (
        <div>
            <div className="flex justify-between pb-4">
                <p>Progress</p>
                <p>{ percent } %</p>
            </div>
            <div className="w-full bg-white h-1">
                { percent > 0 && <div className={`w-[${percent}%] bg-green-900 h-1`}/>}
            </div>
            <div className="flex justify-between">
                <p>{ `${curVal} ${unit}` }</p>
                <p>{ `${endVal} ${unit}` }</p>
            </div>
        </div>
    );
}