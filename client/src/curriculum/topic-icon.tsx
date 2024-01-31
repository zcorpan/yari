import { ReactComponent as ScriptingSVG } from "../../public/assets/curriculum/cur-topic-scripting.svg";
import { ReactComponent as ToolingSVG } from "../../public/assets/curriculum/cur-topic-tooling.svg";
import { ReactComponent as StandardsSVG } from "../../public/assets/curriculum/cur-topic-standards.svg";
import { ReactComponent as StylingSVG } from "../../public/assets/curriculum/cur-topic-styling.svg";
import { ReactComponent as PracticesSVG } from "../../public/assets/curriculum/cur-topic-practices.svg";

// Using this import fails the build...
//import { Topic } from "../../../libs/types/curriculum";
enum Topic {
  WebStandards = "Web Standards & Semantics",
  Styling = "Styling",
  Scripting = "Scripting",
  BestPractices = "Best Practices",
  Tooling = "Tooling",
  None = "",
}

export function TopicIcon({ topic }: { topic: Topic }) {
  switch (topic) {
    case Topic.WebStandards:
      return <StandardsSVG className="topic-icon" />;
    case Topic.Styling:
      return <StylingSVG className="topic-icon" />;
    case Topic.Scripting:
      return <ScriptingSVG className="topic-icon" />;
    case Topic.Tooling:
      return <ToolingSVG className="topic-icon" />;
    case Topic.BestPractices:
      return <PracticesSVG className="topic-icon" />;
    default:
      return <></>;
  }
}
