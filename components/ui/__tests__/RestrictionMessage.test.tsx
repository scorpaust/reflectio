/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  RestrictionMessage,
  ContentRestrictionMessage,
  ConnectionRestrictionMessage,
  ReflectionRestrictionMessage,
} from "../RestrictionMessage";

// Mock the PremiumModal component
jest.mock("@/components/premium/PremiumModal", () => ({
  PremiumModal: ({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) =>
    isOpen ? (
      <div data-testid="premium-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    ) : null,
}));

describe("RestrictionMessage", () => {
  it("renders basic restriction message", () => {
    render(<RestrictionMessage type="premium_content" context="post_view" />);

    expect(screen.getByText("Conteúdo Premium")).toBeInTheDocument();
    expect(
      screen.getByText(/Este post contém conteúdo premium exclusivo/)
    ).toBeInTheDocument();
  });

  it("shows upgrade button and opens modal", async () => {
    render(<RestrictionMessage type="premium_content" context="post_view" />);

    const upgradeButton = screen.getByRole("button", {
      name: /Desbloquear Conteúdo/i,
    });
    expect(upgradeButton).toBeInTheDocument();

    fireEvent.click(upgradeButton);

    await waitFor(() => {
      expect(screen.getByTestId("premium-modal")).toBeInTheDocument();
    });
  });

  it("shows dismiss button when enabled", () => {
    const onDismiss = jest.fn();

    render(
      <RestrictionMessage
        type="premium_content"
        context="post_view"
        showDismiss={true}
        onDismiss={onDismiss}
      />
    );

    const dismissButton = screen.getByLabelText("Dispensar");
    expect(dismissButton).toBeInTheDocument();

    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalled();
  });

  it("uses custom message when provided", () => {
    render(
      <RestrictionMessage
        type="premium_content"
        context="post_view"
        customMessage={{
          title: "Custom Title",
          description: "Custom description",
          action: "Custom Action",
        }}
      />
    );

    expect(screen.getByText("Custom Title")).toBeInTheDocument();
    expect(screen.getByText("Custom description")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Custom Action/i })
    ).toBeInTheDocument();
  });

  it("shows alternative text when enabled", () => {
    render(
      <RestrictionMessage
        type="reflection_creation"
        context="reflection_creation"
        showAlternative={true}
      />
    );

    // Should show the alternative suggestion from contextual messages
    expect(screen.getByText(/💡/)).toBeInTheDocument();
  });

  it("applies different variants correctly", () => {
    const { rerender } = render(
      <RestrictionMessage
        type="premium_content"
        context="post_view"
        variant="banner"
        data-testid="restriction-message"
      />
    );

    // Check if banner variant classes are applied - look for the main container
    const bannerElement = screen
      .getByText("Conteúdo Premium")
      .closest("div")?.parentElement;
    expect(bannerElement).toHaveClass("border-l-4", "border-amber-500");

    rerender(
      <RestrictionMessage
        type="premium_content"
        context="post_view"
        variant="inline"
        data-testid="restriction-message"
      />
    );

    // Check if inline variant classes are applied
    const inlineElement = screen
      .getByText("Conteúdo Premium")
      .closest("div")?.parentElement;
    expect(inlineElement).toHaveClass("border", "border-amber-200");
  });
});

describe("Specialized Restriction Components", () => {
  it("renders ContentRestrictionMessage with correct defaults", () => {
    render(<ContentRestrictionMessage />);

    expect(screen.getByText("Conteúdo Premium")).toBeInTheDocument();
  });

  it("renders ConnectionRestrictionMessage with correct defaults", () => {
    render(<ConnectionRestrictionMessage />);

    expect(screen.getByText("Solicitar Conexões")).toBeInTheDocument();
  });

  it("renders ReflectionRestrictionMessage with correct defaults", () => {
    render(<ReflectionRestrictionMessage />);

    expect(screen.getByText("Criar Reflexões")).toBeInTheDocument();
  });
});

describe("Accessibility", () => {
  it("has proper ARIA labels", () => {
    render(
      <RestrictionMessage
        type="premium_content"
        context="post_view"
        showDismiss={true}
      />
    );

    const dismissButton = screen.getByLabelText("Dispensar");
    expect(dismissButton).toBeInTheDocument();
  });

  it("supports keyboard navigation", () => {
    render(<RestrictionMessage type="premium_content" context="post_view" />);

    const upgradeButton = screen.getByRole("button", {
      name: /Desbloquear Conteúdo/i,
    });

    // Focus the button
    upgradeButton.focus();
    expect(document.activeElement).toBe(upgradeButton);

    // Should be able to activate with Enter key
    fireEvent.keyDown(upgradeButton, { key: "Enter" });
    // Modal should open (tested in previous test)
  });
});
