import {
    CheckCircle2Icon,
    CircleDashedIcon,
    CalendarDaysIcon,
} from "lucide-react";
import { SESSION_STATUS } from "~/lib/session-status";

export const SessionStatusPlannedIcon = CalendarDaysIcon;

export const SessionStatusInProgressIcon = CircleDashedIcon;

export const SessionStatusFinishedIcon = CheckCircle2Icon;

export const SESSION_ICON_MAP = {
    [SESSION_STATUS.PLANNED]: SessionStatusPlannedIcon,
    [SESSION_STATUS.IN_PROGRESS]: SessionStatusInProgressIcon,
    [SESSION_STATUS.FINISHED]: SessionStatusFinishedIcon,
} as const;
