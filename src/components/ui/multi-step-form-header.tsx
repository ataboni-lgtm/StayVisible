/**
    MIT License

    Copyright (c) 2025 AC Autonomous Systems

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.

 */

/* -------------------------------------------------------------------------- */
/*                                    USAGE                                   */
/* -------------------------------------------------------------------------- */
/**
const STEPS = [
  {
    id: 'step-1',
    stepNumber: 0,
    name: 'Appraisal',
    description: '',
  },
  {
    id: 'step-2',
    stepNumber: 1,
    name: 'Commitment',
    description: '',
  },
  {
    id: 'step-3',
    stepNumber: 2,
    name: 'Loan App',
    description: '',
  },
  {
    id: 'step-4',
    stepNumber: 3,
    name: 'Environmental',
    description: '',
  },
  {
    id: 'step-5',
    stepNumber: 4,
    name: 'Closing',
    description: '',
  },
];

const [currentStep, setCurrentStep] = useState<number>(0);

<MultiStepHeader
  steps={STEPS}
  currentStep={currentStep}
  setCurrentStep={setCurrentStep}
/>
 */

'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MultiPartFormStep = {
  id: string;
  name: string;
  stepNumber: number;
  description?: string;
};

interface MultiStepHeaderProps {
  steps: MultiPartFormStep[];
  currentStep: number;
  setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
  disableClickToNavigate?: boolean;
  disabledClickToNavigateSteps?: number[];
}

export function MultiStepHeader({
  steps,
  currentStep,
  setCurrentStep,
  className,
  disableClickToNavigate = false,
  disabledClickToNavigateSteps = [],
}: MultiStepHeaderProps) {
  return (
    <nav
      className={cn('w-full py-4', className)}
      aria-label="Progress"
    >
      {/* MOBILE: */}
      <div className="relative w-full md:hidden">
        {/* Background connecting lines */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-border" />

        {/* Completed connecting lines */}
        <div
          className="absolute top-3 left-0 h-0.5 bg-primary transition-all duration-300"
          style={{
            width: `${Math.max(0, currentStep / (steps.length - 1)) * 100}%`,
          }}
        />

        {/* Step indicators */}
        <ol
          role="list"
          className="relative flex items-center w-full justify-between"
        >
          {steps.map((step, index) => (
            <li
              key={step.id}
              className="flex items-center"
            >
              <div
                className={cn(
                  'flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs z-10',
                  index < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : index === currentStep
                      ? 'border-2 border-primary bg-background text-primary'
                      : 'border-2 border-border bg-background text-muted-foreground',
                )}
              >
                {index < currentStep ? (
                  <Check
                    className="h-3 w-3"
                    aria-hidden="true"
                  />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* DESKTOP: */}
      <ol
        role="list"
        className="hidden space-y-4 md:flex md:space-x-8 md:space-y-0"
      >
        {steps.map((step, index) => {
          return (
            <li
              key={step.id + '_multistep_header'}
              className="md:flex-1"
            >
              <div
                className={cn(
                  'group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4',
                  index < currentStep
                    ? 'border-primary'
                    : index === currentStep
                      ? 'border-primary animate-pulse'
                      : 'border-border',
                  !disableClickToNavigate &&
                    !disabledClickToNavigateSteps.includes(index)
                    ? 'cursor-pointer'
                    : 'cursor-not-allowed',
                )}
                onClick={() => {
                  if (
                    !disableClickToNavigate &&
                    !disabledClickToNavigateSteps.includes(index)
                  ) {
                    setCurrentStep(index);
                  }
                }}
              >
                <span className="flex items-center text-sm font-medium">
                  <span
                    className={cn(
                      'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                      index < currentStep
                        ? 'bg-primary text-primary-foreground'
                        : index === currentStep
                          ? 'border-2 border-primary bg-background text-primary'
                          : 'border-2 border-border bg-background text-muted-foreground',
                    )}
                  >
                    {index < currentStep ? (
                      <Check
                        className="h-5 w-5"
                        aria-hidden="true"
                      />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'ml-3 text-sm font-medium',
                      index < currentStep
                        ? 'text-foreground'
                        : index === currentStep
                          ? 'text-foreground'
                          : 'text-muted-foreground',
                    )}
                  >
                    {step.name}
                  </span>
                </span>
                {step.description && (
                  <span className="ml-11 text-sm text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {/* Mobile step name display */}
      <div className="mt-2 text-center md:hidden">
        <p className="text-sm font-medium">{steps[currentStep]?.name}</p>
        {steps[currentStep]?.description && (
          <p className="text-xs text-muted-foreground">
            {steps[currentStep].description}
          </p>
        )}
      </div>
    </nav>
  );
}
