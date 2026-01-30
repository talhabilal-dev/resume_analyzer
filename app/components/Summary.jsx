import ScoreGauge from "./ScoreGauge";
import ScoreBadge from "./ScoreBadge";

const Category = ({ title, score }) => {
    const textColor = score > 70 ? 'text-green-700'
        : score > 49
            ? 'text-yellow-700' : 'text-red-700';

    return (
        <div className="border-b last:border-b-0 border-gray-700">
            <div className="flex flex-row justify-between items-center px-6 py-4">
                <div className="flex flex-row gap-3 items-center">
                    <p className="text-xl font-semibold text-white">{title}</p>
                    <ScoreBadge score={score} />
                </div>
                <p className="text-2xl font-bold">
                    <span className={textColor}>{score}</span>
                    <span className="text-gray-400">/100</span>
                </p>
            </div>Upload Resume
        </div>
    )
}

const Summary = ({ feedback }) => {
    return (
        <div className="bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl shadow-xl w-full">
            <div className="flex flex-row items-center p-6 gap-8 border-b border-gray-700">
                <ScoreGauge score={feedback.overallScore} />

                <div className="flex flex-col gap-2">
                    <h2 className="text-2xl font-bold text-white">Your Resume Score</h2>
                    <p className="text-base text-gray-300">
                        This score is calculated based on the variables listed below.
                    </p>
                </div>
            </div>

            <Category title="Tone & Style" score={feedback.toneAndStyle.score} />
            <Category title="Content" score={feedback.content.score} />
            <Category title="Structure" score={feedback.structure.score} />
            <Category title="Skills" score={feedback.skills.score} />
        </div>
    )
}
export default Summary
