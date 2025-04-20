import {
    VerticalTimeline,
    VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";

function TimelineComponent({ events }) {
    return (
        <VerticalTimeline>
            {events.map((event, i) => (
                <VerticalTimelineElement
                    key={i}
                    date={event.date}
                    iconStyle={{
                        background: "rgb(33, 150, 243)",
                        color: "#fff",
                    }}
                >
                    <h3 className="vertical-timeline-element-title">
                        {event.title}
                    </h3>
                    <p>{event.description}</p>
                </VerticalTimelineElement>
            ))}
        </VerticalTimeline>
    );
}

export default TimelineComponent;
