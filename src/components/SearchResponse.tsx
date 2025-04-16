import { Workflow, MessageCircle } from "lucide-react";
import { Card } from "./ui/card";
import { Question, HealthResponse, HealthState } from "@/types/health";
import { useState, useEffect } from "react";
import { generateHealthQuestions, generateFinalAssessment } from "@/services/gemini";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface SearchResponseProps {
  query: string;
  visible: boolean;
  loading: boolean;
  response: string;
}

export const SearchResponse = ({ query, visible, loading, response }: SearchResponseProps) => {
  const [healthState, setHealthState] = useState<HealthState>({
    currentQuestionIndex: 0,
    answers: {},
    isComplete: false
  });
  const [healthResponse, setHealthResponse] = useState<HealthResponse | null>(null);
  const [assessment, setAssessment] = useState<{ diagnosis: string; recommendations: string[] } | null>(null);
  const [textInput, setTextInput] = useState("");

  useEffect(() => {
    if (visible && query && !healthResponse) {
      generateHealthQuestions(query).then(setHealthResponse);
    }
  }, [visible, query, healthResponse]);

  const currentQuestion = healthResponse?.questions[healthState.currentQuestionIndex];

  const handleAnswer = (value: any) => {
    if (!currentQuestion) return;

    const newAnswers = {
      ...healthState.answers,
      [currentQuestion.id]: value
    };

    const isLastQuestion = healthState.currentQuestionIndex === (healthResponse?.questions.length ?? 0) - 1;

    if (isLastQuestion) {
      setHealthState(prev => ({ ...prev, answers: newAnswers, isComplete: true }));
      generateFinalAssessment(query, newAnswers).then(setAssessment);
    } else {
      setHealthState(prev => ({
        ...prev,
        answers: newAnswers,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
    setTextInput(""); // Reset text input after submission
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim()) {
      handleAnswer(textInput);
    }
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'yes-no':
        return (
          <div className="flex gap-4">
            <Button
              variant={healthState.answers[question.id] === true ? "default" : "outline"}
              onClick={() => handleAnswer(true)}
            >
              Yes
            </Button>
            <Button
              variant={healthState.answers[question.id] === false ? "default" : "outline"}
              onClick={() => handleAnswer(false)}
            >
              No
            </Button>
          </div>
        );

      case 'multiple-choice':
        return (
          <RadioGroup
            value={healthState.answers[question.id]}
            onValueChange={handleAnswer}
            className="flex flex-col gap-2"
          >
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={option} />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'slider':
        return (
          <div className="space-y-2">
            <Slider
              value={[healthState.answers[question.id] ?? question.min ?? 0]}
              min={question.min}
              max={question.max}
              step={question.step}
              onValueChange={([value]) => handleAnswer(value)}
            />
            <div className="text-sm text-zinc-400">
              Current value: {healthState.answers[question.id] ?? question.min ?? 0}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex flex-col gap-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={option}
                  checked={healthState.answers[question.id]?.includes(option)}
                  onCheckedChange={(checked) => {
                    const currentAnswers = healthState.answers[question.id] || [];
                    const newAnswers = checked
                      ? [...currentAnswers, option]
                      : currentAnswers.filter((a: string) => a !== option);
                    handleAnswer(newAnswers);
                  }}
                />
                <Label htmlFor={option}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case 'text':
        return (
          <form onSubmit={handleTextSubmit} className="space-y-4">
            <Input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full"
            />
            <Button type="submit" disabled={!textInput.trim()}>
              Submit
            </Button>
          </form>
        );

      default:
        return null;
    }
  };

  if (!visible) return null;

  return (
    <div className="w-full max-w-3xl mx-auto mt-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
          <span className="text-white text-sm">P</span>
        </div>
        <h2 className="text-xl text-white font-medium">{query}</h2>
      </div>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <div className="p-4">
          {loading ? (
            <div className="space-y-4 animate-pulse text-zinc-500">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-xs">1</span>
                </div>
                <span className="text-sm">Thinking...</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-xs">2</span>
                </div>
                <span className="text-sm">Preparing questions...</span>
              </div>
            </div>
          ) : assessment ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Assessment</h3>
              <p className="text-sm text-zinc-300">{assessment.diagnosis}</p>
              
              <h3 className="text-lg font-medium mt-4">Recommendations</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-zinc-300">
                {assessment.recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{currentQuestion.text}</h3>
              {renderQuestion(currentQuestion)}
              
              <div className="text-sm text-zinc-500 mt-2">
                Question {healthState.currentQuestionIndex + 1} of {healthResponse?.questions.length}
              </div>
            </div>
          ) : (
            <div className="text-sm text-zinc-300">Loading questions...</div>
          )}
        </div>
      </Card>
    </div>
  );
};
