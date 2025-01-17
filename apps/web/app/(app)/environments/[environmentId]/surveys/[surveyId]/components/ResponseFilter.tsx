"use client";

import {
  SelectedFilterValue,
  useResponseFilter,
} from "@/app/(app)/environments/[environmentId]/components/ResponseFilterContext";
import QuestionFilterComboBox from "@/app/(app)/environments/[environmentId]/surveys/[surveyId]/components/QuestionFilterComboBox";
import clsx from "clsx";
import { isEqual } from "lodash";
import { TrashIcon } from "lucide-react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useEffect, useState } from "react";

import { TSurveyTSurveyQuestionType } from "@formbricks/types/surveys";
import { Button } from "@formbricks/ui/Button";
import { Checkbox } from "@formbricks/ui/Checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@formbricks/ui/Popover";

import QuestionsComboBox, { OptionsType, QuestionOption } from "./QuestionsComboBox";

export type QuestionFilterOptions = {
  type: TSurveyTSurveyQuestionType | "Attributes" | "Tags";
  filterOptions: string[];
  filterComboBoxOptions: string[];
  id: string;
};

const ResponseFilter = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { selectedFilter, setSelectedFilter, selectedOptions } = useResponseFilter();
  const [filterValue, setFilterValue] = useState<SelectedFilterValue>(selectedFilter);

  const handleOnChangeQuestionComboBoxValue = (value: QuestionOption, index: number) => {
    if (filterValue.filter[index].questionType) {
      // Create a new array and copy existing values from SelectedFilter
      filterValue.filter[index] = {
        questionType: value,
        filterType: {
          filterComboBoxValue: undefined,
          filterValue: selectedOptions.questionFilterOptions.find(
            (q) => q.type === value.type || q.type === value.questionType
          )?.filterOptions[0],
        },
      };
      setFilterValue({ filter: [...filterValue.filter], onlyComplete: filterValue.onlyComplete });
    } else {
      // Update the existing value at the specified index
      filterValue.filter[index].questionType = value;
      filterValue.filter[index].filterType = {
        filterComboBoxValue: undefined,
        filterValue: selectedOptions.questionFilterOptions.find(
          (q) => q.type === value.type || q.type === value.questionType
        )?.filterOptions[0],
      };
      setFilterValue({ ...filterValue });
    }
  };

  // when filter is opened and added a filter without selecting any option clear out that value
  const clearItem = () => {
    setFilterValue({
      filter: filterValue.filter.filter((s) => {
        // keep the filter if questionType is selected and filterComboBoxValue is selected
        return s.questionType.hasOwnProperty("label") && s.filterType.filterComboBoxValue?.length;
      }),
      onlyComplete: filterValue.onlyComplete,
    });
  };

  // remove the added filter if nothing is selected when filter is closed
  useEffect(() => {
    if (!isOpen) {
      clearItem();
      handleApplyFilters();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleAddNewFilter = () => {
    setFilterValue({
      ...filterValue,
      filter: [
        ...filterValue.filter,
        {
          questionType: {},
          filterType: { filterComboBoxValue: undefined, filterValue: undefined },
        },
      ],
    });
  };

  const handleClearAllFilters = () => {
    setFilterValue((filterValue) => ({ ...filterValue, filter: [] }));
    setSelectedFilter((selectedFilters) => ({ ...selectedFilters, filter: [] }));
    setIsOpen(false);
  };

  const handleDeleteFilter = (index: number) => {
    filterValue.filter.splice(index, 1);
    setFilterValue({ ...filterValue });
  };

  const handleOnChangeFilterComboBoxValue = (o: string | string[], index: number) => {
    filterValue.filter[index] = {
      ...filterValue.filter[index],
      filterType: {
        filterComboBoxValue: o,
        filterValue: filterValue.filter[index].filterType.filterValue,
      },
    };
    setFilterValue({ ...filterValue });
  };
  const handleOnChangeFilterValue = (o: string, index: number) => {
    filterValue.filter[index] = {
      ...filterValue.filter[index],
      filterType: { filterComboBoxValue: undefined, filterValue: o },
    };
    setFilterValue({ ...filterValue });
  };
  const handleRemoveMultiSelect = (value: string[], index) => {
    filterValue.filter[index] = {
      ...filterValue.filter[index],
      filterType: {
        filterComboBoxValue: value,
        filterValue: filterValue.filter[index].filterType.filterValue,
      },
    };
    setFilterValue({ ...filterValue });
  };

  const handleCheckOnlyComplete = (checked: boolean) => {
    setFilterValue({ ...filterValue, onlyComplete: checked });
  };

  // remove the filter which has already been selected
  const questionComboBoxOptions = selectedOptions.questionOptions.map((q) => {
    return {
      ...q,
      option: q.option.filter((o) => !filterValue.filter.some((f) => f?.questionType?.id === o?.id)),
    };
  });

  const handleApplyFilters = () => {
    clearItem();
    if (!isEqual(filterValue, selectedFilter)) {
      setSelectedFilter(filterValue);
    }
    setIsOpen(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleApplyFilters();
    }
    setIsOpen(open);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger className="flex min-w-[8rem] items-center justify-between rounded border border-slate-200 bg-white p-3 text-sm text-slate-600 hover:border-slate-300 sm:min-w-[11rem] sm:px-6 sm:py-3">
        Filter {filterValue.filter.length > 0 && `(${filterValue.filter.length})`}
        <div className="ml-3">
          {isOpen ? (
            <ChevronUp className="ml-2 h-4 w-4 opacity-50" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[300px] border-slate-200  bg-slate-100 p-6 sm:w-[400px] md:w-[750px] lg:w-[1000px] ">
        <div className="mb-8 flex flex-wrap items-start justify-between">
          <p className="hidden text-lg font-bold text-black sm:block">Show all responses that match</p>
          <p className="block text-base  text-slate-500 sm:hidden">Show all responses where...</p>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-normal text-slate-600">Only completed</label>
            <Checkbox
              className={clsx("rounded-md", filterValue.onlyComplete && "bg-black text-white")}
              checked={filterValue.onlyComplete}
              onCheckedChange={(checked) => {
                typeof checked === "boolean" && handleCheckOnlyComplete(checked);
              }}
            />
          </div>
        </div>
        {filterValue.filter?.map((s, i) => (
          <>
            <div className="flex w-full flex-wrap gap-3 md:flex-nowrap">
              <div
                className="grid w-full grid-cols-1 items-center gap-3 md:grid-cols-2"
                key={`${s.questionType.id}-${i}`}>
                <QuestionsComboBox
                  key={`${s.questionType.label}-${i}`}
                  options={questionComboBoxOptions}
                  selected={s.questionType}
                  onChangeValue={(value) => handleOnChangeQuestionComboBoxValue(value, i)}
                />
                <QuestionFilterComboBox
                  key={`${s.questionType.id}-${i}`}
                  filterOptions={
                    selectedOptions.questionFilterOptions.find(
                      (q) => q.type === s.questionType.type || q.type === s.questionType.questionType
                    )?.filterOptions
                  }
                  filterComboBoxOptions={
                    selectedOptions.questionFilterOptions.find(
                      (q) =>
                        (q.type === s.questionType.questionType || q.type === s.questionType.type) &&
                        q.id === s.questionType.id
                    )?.filterComboBoxOptions
                  }
                  filterValue={filterValue.filter[i].filterType.filterValue}
                  filterComboBoxValue={filterValue.filter[i].filterType.filterComboBoxValue}
                  type={
                    s?.questionType?.type === OptionsType.QUESTIONS
                      ? s?.questionType?.questionType
                      : s?.questionType?.type
                  }
                  handleRemoveMultiSelect={(value) => handleRemoveMultiSelect(value, i)}
                  onChangeFilterComboBoxValue={(value) => handleOnChangeFilterComboBoxValue(value, i)}
                  onChangeFilterValue={(value) => handleOnChangeFilterValue(value, i)}
                  disabled={!s?.questionType?.label}
                />
              </div>
              <div className="flex w-full items-center justify-end gap-1 md:w-auto">
                <p className="block font-light text-slate-500 md:hidden">Delete</p>
                <TrashIcon
                  className="w-4 cursor-pointer text-slate-500 md:text-black"
                  onClick={() => handleDeleteFilter(i)}
                />
              </div>
            </div>
            {i !== filterValue.filter.length - 1 && (
              <div className="my-6 flex items-center">
                <p className="mr-6 text-base text-slate-600">And</p>
                <hr className="w-full text-slate-600" />
              </div>
            )}
          </>
        ))}
        <div className="mt-8 flex items-center justify-between">
          <Button size="sm" variant="darkCTA" onClick={handleAddNewFilter}>
            Add filter
            <Plus width={18} height={18} className="ml-2" />
          </Button>
          <div className="flex gap-2">
            <Button size="sm" variant="primary" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
            <Button size="sm" variant="secondary" onClick={handleClearAllFilters}>
              Clear all
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ResponseFilter;
