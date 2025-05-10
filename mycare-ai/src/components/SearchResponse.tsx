import { Workflow, MessageCircle } from "lucide-react";
import { Card } from "./ui/card";
import { HealthResponse, HealthState } from "@/types/health";
import { useState, useEffect } from "react";
import { generateHealthQuestions, generateFinalAssessment } from "@/services/gemini";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Checkbox } from "./ui/checkbox";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Calendar } from "./ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Check, ChevronUp, ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

interface Question {
  title?: string;
  question: string;
  questionId: string;
  type: string;
  summary?: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
}

interface SearchResponseProps {
  query: string;
  visible: boolean;
  loading: boolean;
  currentQuestion: Question | null;
  finalAssessment: string | null;
  onAnswer: (questionId: string, answer: any) => void;
  chatHistory?: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}

export const SearchResponse = ({ 
  query, 
  visible, 
  loading,
  currentQuestion,
  finalAssessment,
  onAnswer,
  chatHistory = []
}: SearchResponseProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [numberValue, setNumberValue] = useState<string>("");

  useEffect(() => {
    // Reset selected options and number value when question changes
    setSelectedOptions([]);
    setNumberValue("");
  }, [currentQuestion?.questionId]);

  const handleMultiSelect = (option: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      newSelected = [...selectedOptions, option];
    } else {
      newSelected = selectedOptions.filter(item => item !== option);
    }
    setSelectedOptions(newSelected);
  };

  const handleNumberChange = (value: string, question: Question) => {
    // Only allow numbers and decimal point
    if (!/^\d*\.?\d*$/.test(value)) return;

    const numValue = parseFloat(value);
    const min = question.min ?? -Infinity;
    const max = question.max ?? Infinity;

    // Allow empty string for backspacing
    if (value === "") {
      setNumberValue("");
      return;
    }

    // Validate number is within bounds
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      setNumberValue(value);
    }
  };

  const handleNumberSubmit = (question: Question) => {
    const numValue = parseFloat(numberValue);
    if (!isNaN(numValue)) {
      onAnswer(question.questionId, numValue);
    }
  };

  const incrementNumber = (question: Question) => {
    const current = numberValue === "" ? (question.min ?? 0) : parseFloat(numberValue);
    const step = question.step ?? 1;
    const max = question.max ?? Infinity;
    const newValue = Math.min(current + step, max);
    setNumberValue(newValue.toString());
  };

  const decrementNumber = (question: Question) => {
    const current = numberValue === "" ? (question.min ?? 0) : parseFloat(numberValue);
    const step = question.step ?? 1;
    const min = question.min ?? -Infinity;
    const newValue = Math.max(current - step, min);
    setNumberValue(newValue.toString());
  };

  const renderQuestion = (question: Question) => {
    switch (question.type.toLowerCase()) {
      case 'number-picker':
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="grid grid-cols-[1fr,auto] gap-2">
                <Input
                  type="text"
                  value={numberValue}
                  onChange={(e) => handleNumberChange(e.target.value, question)}
                  placeholder={`Enter value (${question.min} - ${question.max})`}
                  className="w-full"
                />
                <div className="flex flex-col gap-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => incrementNumber(question)}
                    disabled={numberValue !== "" && parseFloat(numberValue) >= (question.max ?? Infinity)}
                  >
                    <ChevronUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => decrementNumber(question)}
                    disabled={numberValue !== "" && parseFloat(numberValue) <= (question.min ?? -Infinity)}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-zinc-400">
              <span>Min: {question.min}</span>
              <span>Step: {question.step}</span>
              <span>Max: {question.max}</span>
            </div>
            <Button
              onClick={() => handleNumberSubmit(question)}
              disabled={numberValue === "" || isNaN(parseFloat(numberValue))}
              className="w-full mt-4"
            >
              Submit
            </Button>
          </div>
        );

      case 'multiple-choice':
        return (
          <RadioGroup
            onValueChange={(value) => onAnswer(question.questionId, value)}
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


        case 'summary':
          return (
            <div className="space-y-2">
              {/* <h3 className="text-lg font-semibold text-white">{question.title ?? "Summary"}</h3> */}
              <p className="text-sm text-zinc-300">
                {question.summary ?? "No summary provided."}
              </p>
            </div>
          );
        

      case 'multi-select':
        return (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              {question.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={option}
                    checked={selectedOptions.includes(option)}
                    onCheckedChange={(checked) => handleMultiSelect(option, checked as boolean)}
                  />
                  <Label htmlFor={option}>{option}</Label>
                </div>
              ))}
            </div>
            <Button 
              onClick={() => onAnswer(question.questionId, selectedOptions)}
              disabled={selectedOptions.length === 0}
              className="mt-4"
            >
              Submit Selection
            </Button>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-4">
            <Slider
              defaultValue={[question.min || 0]}
              min={question.min}
              max={question.max}
              step={question.step}
              onValueCommit={([value]) => onAnswer(question.questionId, value)}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-zinc-400">
              <span>{question.min}</span>
              <span>{question.max}</span>
            </div>
          </div>
        );

      case 'date':
      case 'date-picker':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Pick a date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                onSelect={(date) => {
                  if (date) {
                    onAnswer(question.questionId, format(date, 'yyyy-MM-dd'));
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case 'text':
        return (
          <form onSubmit={(e) => {
            e.preventDefault();
            const input = (e.target as HTMLFormElement).querySelector('input');
            if (input?.value) onAnswer(question.questionId, input.value);
          }} className="space-y-4">
            <Input
              type="text"
              placeholder="Type your answer here..."
              className="w-full"
            />
            <Button type="submit">Submit</Button>
          </form>
        );

      case 'yes-no':
      case 'yes_no':
        return (
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="w-24"
              onClick={() => onAnswer(question.questionId, "Yes")}
            >
              Yes
            </Button>
            <Button
              variant="outline"
              className="w-24"
              onClick={() => onAnswer(question.questionId, "No")}
            >
              No
            </Button>
          </div>
        );

      default:
        console.log("Unknown question type:", question.type);
        return (
          <div className="text-sm text-red-500">
            Unsupported question type: {question.type}
          </div>
        );
    }
  };

  const renderChatHistory = () => {
    return chatHistory.map((message, index) => (
      <div key={index} className={`mb-4 ${message.role === 'assistant' ? 'bg-zinc-900/50' : ''} p-4 rounded-lg`}>
        <div className="flex items-center gap-2 mb-2">
          <div className={`w-8 h-8 rounded-full ${message.role === 'assistant' ? 'bg-emerald-600' : 'bg-blue-600'} flex items-center justify-center`}>
            <span className="text-white text-sm">{message.role === 'assistant' ? 'P' : 'U'}</span>
          </div>
          <p className="text-sm text-zinc-300">{message.content}</p>
        </div>
      </div>
    ));
  };

  if (!visible) return null;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Chat History */}
      {chatHistory.length > 0 && (
        <div className="space-y-4">
          {renderChatHistory()}
        </div>
      )}

      {/* Current Question/Response */}
      {(loading || currentQuestion || finalAssessment) && (
        <Card className="bg-zinc-900/50 border-zinc-800 mt-4">
          <div className="p-4">
            {loading ? (
              <div className="space-y-4 animate-pulse text-zinc-500">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
                    <span className="text-xs">1</span>
                  </div>
                  <span className="text-sm">Processing your query...</span>
                </div>
              </div>
            ) : finalAssessment ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Assessment</h3>
                <p className="text-sm text-zinc-300">{finalAssessment}</p>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">{currentQuestion.question}</h3>
                {renderQuestion(currentQuestion)}
              </div>
            ) : null}
          </div>
        </Card>
      )}
    </div>
  );
};
