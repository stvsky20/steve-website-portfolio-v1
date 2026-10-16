import {
  ArrowUpRight,
  Check,
  Command,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { CardContainer } from "@/components/ui/3d-card";

export function ProjectArt({ id }: { id: string }) {
  return (
    <CardContainer>
      <ProjectIllustration id={id} />
    </CardContainer>
  );
}

function ProjectIllustration({ id }: { id: string }) {
  if (id === "orbit")
    return (
      <div className="orbit-art" aria-hidden="true">
        <div className="mock-window">
          <div className="mock-sidebar">
            <div className="mock-brand">
              <Command size={18} /> orbit<span>⌄</span>
            </div>
            <div className="mock-search">
              <Search size={10} /> Search anything
            </div>
            <p className="mock-item active">◈ Overview</p>
            <p className="mock-item">▦ Projects</p>
            <p className="mock-item">◷ My tasks</p>
            <p className="mock-item">▤ Documents</p>
            <span className="sidebar-caption">YOUR WORKSPACE</span>
            <p className="mock-item">● Product launch</p>
            <p className="mock-item">● Website redesign</p>
            <div className="mock-profile">
              <span>JD</span>
              <div>
                Jamie Davis<small>Personal workspace</small>
              </div>
            </div>
          </div>
          <div className="mock-content">
            <div className="mock-top">
              <span>Workspace / Overview</span>
              <span>✦</span>
            </div>
            <div className="mock-heading">
              <div>
                <small>MONDAY, SEPTEMBER 21</small>
                <h4>Let&apos;s make things happen.</h4>
                <p>Your team&apos;s work, in one orbit.</p>
              </div>
              <span className="mock-add">
                <Plus size={10} /> New project
              </span>
            </div>
            <div className="mock-stats">
              <div>
                <span>Active projects</span>
                <b>
                  08 <small>↗ 2 this week</small>
                </b>
              </div>
              <div>
                <span>Tasks completed</span>
                <b>
                  24 <small>↗ 12 this week</small>
                </b>
              </div>
              <div>
                <span>Team velocity</span>
                <b>
                  92% <small>On track</small>
                </b>
              </div>
            </div>
            <div className="mock-board-title">
              <b>Your projects</b>
              <SlidersHorizontal size={12} />
            </div>
            <div className="mock-board">
              {["To do", "In progress", "In review"].map((label, index) => (
                <div key={label}>
                  <span className="board-label">
                    {label}
                    <small>{[3, 2, 2][index]}</small>
                    <Plus size={10} />
                  </span>
                  {[0, 1].map((item) => (
                    <div className="mock-task" key={item}>
                      <span className={`task-tag tag-${index}`}>
                        {["DESIGN", "DEVELOPMENT", "STRATEGY"][index]}
                      </span>
                      <h5>
                        {
                          [
                            [
                              "Map the user journey",
                              "Explore visual direction",
                            ],
                            ["Build the dashboard", "Connect the API"],
                            ["Review onboarding", "Prepare for launch"],
                          ][index][item]
                        }
                      </h5>
                      <div>
                        <span>◷ Sep {24 + index + item}</span>
                        <span className="avatar-dot">
                          {["AK", "JD", "MS"][index]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <span className="art-caption">A CLEARER VIEW OF WHAT&apos;S NEXT.</span>
      </div>
    );
  if (id === "forma")
    return (
      <div className="forma-art" aria-hidden="true">
        <div className="shop-nav">
          <b>forma.</b>
          <span>Objects for everyday living</span>
          <span>Bag (0)</span>
        </div>
        <div className="shop-inner">
          <div className="shop-type">
            <span>THE EVERYDAY COLLECTION</span>
            <h4>
              Good design.
              <br />
              <em>Great company.</em>
            </h4>
            <p>
              Thoughtful objects.
              <br />
              Made to live with.
            </p>
            <span className="shop-link">
              Explore collection <ArrowUpRight size={13} />
            </span>
          </div>
          <div className="lamp">
            <div className="lamp-shade" />
            <div className="lamp-stem" />
            <div className="lamp-base" />
          </div>
        </div>
        <div className="shop-bottom">
          <span>01 / 03</span>
          <span>The Arc Lamp — Clay</span>
          <Plus size={16} />
        </div>
      </div>
    );
  return (
    <div className="launch-art" aria-hidden="true">
      <div className="launch-head">
        <span className="launch-mark">↗</span>
        <b>Launchpad</b>
        <MoreHorizontal size={18} />
      </div>
      <div className="launch-heading">
        <span>FROM AMBITION TO ACTION</span>
        <h4>
          Big picture.
          <br />
          Clear next steps.
        </h4>
      </div>
      <div className="roadmap">
        <div className="roadmap-line" />
        {["Discover", "Define", "Build", "Launch"].map((label, index) => (
          <div className={`roadmap-step step-${index}`} key={label}>
            <div className="roadmap-dot">
              {index < 2 ? <Check size={14} /> : index + 1}
            </div>
            <b>{label}</b>
            <small>
              {
                [
                  "Ask better questions",
                  "Make the right plan",
                  "Bring it to life",
                  "Make it matter",
                ][index]
              }
            </small>
            <span className="roadmap-status">
              {["COMPLETE", "COMPLETE", "IN PROGRESS", "UP NEXT"][index]}
            </span>
          </div>
        ))}
      </div>
      <div className="launch-bottom">
        <span>
          <i /> Every detail. One direction.
        </span>
        <span>Q3 → Q4</span>
      </div>
    </div>
  );
}
